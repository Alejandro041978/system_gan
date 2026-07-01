// POST /api/send-onboarding
// Envía el email de bienvenida/onboarding a una postulación aprobada.
// Puede llamarse manualmente desde el superadmin panel.

import { createClient } from '@supabase/supabase-js';
import { sendEmail, tplOnboarding } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Token inválido' });

  const { data: profile } = await supabase
    .from('profiles').select('app_role').eq('id', user.id).single();

  if (profile?.app_role !== 'super_admin') {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  const { app_id } = req.body;
  if (!app_id) return res.status(400).json({ error: 'app_id requerido' });

  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('id', app_id)
    .single();

  if (!app) return res.status(404).json({ error: 'Postulación no encontrada' });
  if (app.final_decision !== 'approved') {
    return res.status(400).json({ error: 'La postulación no está aprobada' });
  }

  const tpl = tplOnboarding({
    institution_name: app.institution_name,
    contact_name:     app.contact_name,
    lang:             app.contact_lang || 'es',
  });

  const result = await sendEmail({ to: app.contact_email, ...tpl });

  if (!result.ok) {
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }

  await supabase
    .from('applications')
    .update({ onboarding_sent: true, onboarding_notify_at: new Date().toISOString() })
    .eq('id', app_id);

  return res.status(200).json({ ok: true });
}
