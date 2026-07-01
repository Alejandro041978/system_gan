// Vercel Cron Function — GET /api/notify
// Se ejecuta cada hora. Busca postulaciones cuyo plazo de 68h venció
// y cuyo postulante aún no fue notificado. Envía el email de decisión final.
//
// Configurado en vercel.json:
//   { "crons": [{ "path": "/api/notify", "schedule": "0 * * * *" }] }

import { createClient } from '@supabase/supabase-js';
import { sendEmail, tplDecisionNotification, tplOnboarding } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Vercel llama el cron con GET; también permitimos POST para testing manual
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que es una llamada legítima de Vercel Cron o del super_admin
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Vercel Cron añade automáticamente el header si configuramos CRON_SECRET
    // Si no hay secret configurado, permitimos (útil en desarrollo)
    if (authHeader !== undefined) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const now = new Date().toISOString();

  // Buscar postulaciones vencidas no notificadas
  const { data: pending, error } = await supabase
    .from('applications')
    .select('*')
    .eq('applicant_notified', false)
    .lte('notify_at', now)
    .not('notify_at', 'is', null);

  if (error) {
    console.error('[notify cron] DB error:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!pending?.length) {
    return res.status(200).json({ processed: 0, message: 'Nothing to notify' });
  }

  const results = [];

  for (const app of pending) {
    // La decisión final es: lo que el super_admin haya elegido, o si sigue 'pending',
    // se convierte en la decisión de la IA en este momento.
    const finalDecision = (app.final_decision === 'pending' || !app.final_decision)
      ? (app.ai_decision || 'review')
      : app.final_decision;

    // Si aún sigue 'pending', escribir la decisión definitiva de la IA
    if (app.final_decision === 'pending' || !app.final_decision) {
      await supabase
        .from('applications')
        .update({ final_decision: finalDecision, reviewed_at: now })
        .eq('id', app.id);

      // Si la IA aprobó y no existe institución, crearla
      if (finalDecision === 'approved' && !app.institution_id) {
        const { data: inst } = await supabase
          .from('institutions')
          .insert({
            name:          app.institution_name,
            country:       app.country,
            type:          app.institution_type,
            website:       app.website,
            founded_year:  app.founded_year,
            student_count: app.student_count,
            programs:      app.programs_count,
            accreditations: app.accreditations,
            status:        'approved',
          })
          .select()
          .single();

        if (inst) {
          await supabase
            .from('applications')
            .update({ institution_id: inst.id })
            .eq('id', app.id);

          // Crear cuenta de usuario para el contacto como institution_admin
          const { data: authUser, error: createErr } = await supabase.auth.admin.createUser({
            email:         app.contact_email,
            email_confirm: true,
            user_metadata: { full_name: app.contact_name },
          });

          if (!createErr && authUser?.user) {
            await supabase.from('profiles').upsert({
              id:             authUser.user.id,
              full_name:      app.contact_name,
              email:          app.contact_email,
              app_role:       'institution_admin',
              institution_id: inst.id,
              preferred_lang: app.contact_lang || 'es',
              is_visible:     true,
            });
            console.log(`[notify cron] Created institution_admin for ${app.contact_email}`);
          } else if (createErr?.message?.includes('already registered')) {
            // User exists — update their profile to link institution
            const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            const existing = users?.find(u => u.email === app.contact_email);
            if (existing) {
              await supabase.from('profiles').upsert({
                id:             existing.id,
                full_name:      app.contact_name,
                email:          app.contact_email,
                app_role:       'institution_admin',
                institution_id: inst.id,
                preferred_lang: app.contact_lang || 'es',
                is_visible:     true,
              });
            }
          }
        }
      }
    }

    // Enviar email al postulante
    const lang = app.contact_lang || 'es';
    const tpl  = tplDecisionNotification({
      institution_name: app.institution_name,
      contact_name:     app.contact_name,
      final_decision:   finalDecision,
      ai_justification: app.ai_justification,
      lang,
    });

    const emailResult = await sendEmail({ to: app.contact_email, ...tpl });

    // Marcar como notificado y programar email de bienvenida (16h después) si fue aprobado
    const onboardingAt = finalDecision === 'approved'
      ? new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString()
      : null;

    await supabase
      .from('applications')
      .update({
        applicant_notified: true,
        ...(onboardingAt ? { onboarding_notify_at: onboardingAt } : {}),
      })
      .eq('id', app.id);

    results.push({
      id:        app.id,
      institution: app.institution_name,
      decision:  finalDecision,
      email_ok:  emailResult.ok,
    });

    console.log(`[notify cron] Notified ${app.institution_name} → ${finalDecision}`);
  }

  // ── Segunda pasada: emails de bienvenida (onboarding, 16h después) ──────────
  const { data: onboardingPending } = await supabase
    .from('applications')
    .select('*')
    .eq('final_decision', 'approved')
    .eq('onboarding_sent', false)
    .lte('onboarding_notify_at', now)
    .not('onboarding_notify_at', 'is', null);

  const onboardingResults = [];

  for (const app of onboardingPending || []) {
    const lang = app.contact_lang || 'es';
    const tpl  = tplOnboarding({
      institution_name: app.institution_name,
      contact_name:     app.contact_name,
      lang,
    });

    const emailResult = await sendEmail({ to: app.contact_email, ...tpl });

    await supabase
      .from('applications')
      .update({ onboarding_sent: true })
      .eq('id', app.id);

    onboardingResults.push({
      id:          app.id,
      institution: app.institution_name,
      email_ok:    emailResult.ok,
    });

    console.log(`[notify cron] Onboarding sent → ${app.institution_name}`);
  }

  return res.status(200).json({
    processed: results.length,
    results,
    onboarding_processed: onboardingResults.length,
    onboarding_results: onboardingResults,
  });
}
