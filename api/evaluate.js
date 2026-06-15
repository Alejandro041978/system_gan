// Vercel Function — POST /api/evaluate
// Recibe los datos de postulación, los evalúa con Claude y guarda en Supabase

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, tplConfirmation, tplAdminNotification } from './_email.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RUBRIC_PROMPT = `Eres el evaluador oficial de postulaciones para GAN (Global Academic Network), una red internacional de universidades.

Tu tarea es evaluar una postulación de membresía usando la siguiente rúbrica objetiva:

## RÚBRICA GAN (Total: 100 puntos)

### 1. ACREDITACIONES (40 puntos)
- 35-40 pts: Múltiples acreditaciones internacionales reconocidas (AACSB, ABET, EQUIS, WASC, etc.)
- 25-34 pts: Al menos una acreditación internacional o varias nacionales sólidas
- 15-24 pts: Acreditaciones nacionales básicas o en proceso de acreditación internacional
- 5-14 pts:  Solo menciona acreditación sin detalles, o acreditaciones menores
- 0-4 pts:   Sin acreditaciones o información muy vaga

### 2. MOTIVACIÓN Y ACTIVIDADES PROPUESTAS (30 puntos)
- 26-30 pts: Motivación clara y específica, alineada con la misión GAN, múltiples actividades concretas y viables
- 20-25 pts: Buena motivación, propone actividades relevantes aunque algunas son genéricas
- 12-19 pts: Motivación presente pero superficial, actividades poco específicas
- 5-11 pts:  Motivación vaga, pocas actividades o no alineadas
- 0-4 pts:   Sin motivación clara o texto copiado/genérico

### 3. DATOS INSTITUCIONALES (20 puntos)
- 17-20 pts: Institución establecida (>20 años), gran número de estudiantes y programas, web verificable
- 12-16 pts: Institución consolidada con buenos indicadores
- 7-11 pts:  Institución joven o datos incompletos pero coherentes
- 3-6 pts:   Datos muy básicos o inconsistentes
- 0-2 pts:   Información mínima o dudosa

### 4. CONTACTO Y SERIEDAD (10 puntos)
- 9-10 pts: Contacto con cargo directivo claro, email institucional, teléfono, datos completos
- 6-8 pts:  Cargo relevante, email institucional, datos suficientes
- 3-5 pts:  Cargo poco claro o email no institucional
- 0-2 pts:  Datos de contacto incompletos o email genérico (gmail, hotmail, etc.)

## INSTRUCCIONES

1. Evalúa cada criterio de forma objetiva basándote SOLO en la información proporcionada
2. No inferas ni supongas información que no está presente
3. Si la motivación tiene menos de 150 caracteres, penaliza fuertemente ese criterio
4. Emails institucionales (@universidad.edu, @inst.ac, etc.) suman puntos en contacto
5. Emails genéricos (@gmail, @hotmail, @yahoo) restan puntos en contacto

Responde ÚNICAMENTE con un JSON válido en este formato exacto (sin markdown, sin texto adicional):
{
  "score": <número total 0-100>,
  "decision": "<approved|rejected|review>",
  "breakdown": {
    "accreditation": <0-40>,
    "motivation": <0-30>,
    "institution": <0-20>,
    "contact": <0-10>
  },
  "justification": "<párrafo en el idioma solicitado explicando la decisión, máximo 200 palabras>"
}

Reglas de decisión:
- score >= 70 → "approved"
- score >= 55 y < 70 → "review"
- score < 55 → "rejected"`;

const LANG_INSTRUCTION = {
  es: 'Escribe la justificación en español.',
  en: 'Write the justification in English.',
  pt: 'Escreva a justificativa em português.',
  fr: 'Rédigez la justification en français.',
};

// Delay en ms antes de notificar al postulante (68 horas)
const NOTIFY_DELAY_MS = 68 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    institution_name, country, institution_type, website, founded_year,
    contact_name, contact_role, contact_email, contact_phone,
    student_count, programs_count, accreditations, motivation,
    proposed_activities, lang = 'es'
  } = req.body;

  if (!institution_name || !contact_email || !motivation || !accreditations) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const activitiesText = Array.isArray(proposed_activities)
    ? proposed_activities.join(', ')
    : proposed_activities || 'No especificadas';

  const applicationText = `
INSTITUCIÓN: ${institution_name}
PAÍS: ${country}
TIPO: ${institution_type}
SITIO WEB: ${website || 'No proporcionado'}
AÑO FUNDACIÓN: ${founded_year || 'No especificado'}

CONTACTO: ${contact_name} — ${contact_role}
EMAIL: ${contact_email}
TELÉFONO: ${contact_phone || 'No proporcionado'}

ESTUDIANTES: ${student_count?.toLocaleString() || 'No especificado'}
PROGRAMAS ACADÉMICOS: ${programs_count || 'No especificado'}
ACREDITACIONES: ${accreditations}

MOTIVACIÓN PARA UNIRSE A GAN:
${motivation}

ACTIVIDADES PROPUESTAS CON GAN:
${activitiesText}
`.trim();

  try {
    // ── 1. Evaluar con Claude ─────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${RUBRIC_PROMPT}\n\n${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.es}\n\n## POSTULACIÓN A EVALUAR:\n\n${applicationText}`
      }]
    });

    const rawText = message.content[0].text.trim();
    let evaluation;
    try {
      evaluation = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Invalid JSON from Claude');
      evaluation = JSON.parse(match[0]);
    }

    // ── 2. Guardar en Supabase ────────────────────────────────────────────
    const notifyAt = new Date(Date.now() + NOTIFY_DELAY_MS).toISOString();

    const { data: savedApp, error: dbError } = await supabase
      .from('applications')
      .insert({
        institution_name,
        country,
        institution_type,
        website:             website || null,
        founded_year:        founded_year || null,
        contact_name,
        contact_role,
        contact_email,
        contact_phone:       contact_phone || null,
        student_count:       student_count || null,
        programs_count:      programs_count || null,
        accreditations,
        motivation,
        proposed_activities: Array.isArray(proposed_activities) ? proposed_activities : [],
        ai_score:            evaluation.score,
        ai_decision:         evaluation.decision,
        ai_justification:    evaluation.justification,
        ai_breakdown:        evaluation.breakdown,
        final_decision:      'pending',   // siempre pending hasta que el cron lo envíe
        contact_lang:        lang,
        notify_at:           notifyAt,
        applicant_notified:  false,
        admin_notified:      false,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
    }

    // ── 3 & 4. Emails en paralelo ─────────────────────────────────────────
    const confirmTpl = tplConfirmation({ institution_name, contact_name, lang });

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@balticec.com';
    const appUrl     = process.env.APP_URL || 'https://system-gan.vercel.app';
    const adminTpl   = tplAdminNotification({
      institution_name,
      contact_name,
      contact_email,
      country,
      ai_score:         evaluation.score,
      ai_decision:      evaluation.decision,
      ai_justification: evaluation.justification,
      app_id:           savedApp?.id,
      adminUrl:         `${appUrl}/pages/superadmin.html`,
    });

    const [, adminResult] = await Promise.all([
      sendEmail({ to: contact_email, ...confirmTpl }),
      sendEmail({ to: adminEmail,    ...adminTpl   }),
    ]);

    if (savedApp && adminResult.ok) {
      await supabase.from('applications').update({ admin_notified: true }).eq('id', savedApp.id);
    }

    return res.status(200).json({
      decision:      evaluation.decision,
      score:         evaluation.score,
      breakdown:     evaluation.breakdown,
      justification: evaluation.justification
    });

  } catch (err) {
    console.error('Evaluation error:', err);
    return res.status(500).json({ error: 'Evaluation failed', detail: err.message });
  }
}
