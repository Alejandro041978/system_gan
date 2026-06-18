// POST /api/send-otp
// Genera un OTP para el email indicado y lo envía via Resend con nuestro template.
// Solo funciona para usuarios existentes en la plataforma.

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, lang = 'es' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  // Verificar que el usuario existe en la plataforma
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, preferred_lang')
    .eq('email', email)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Este correo no está registrado en GAN System' });
  }

  // Generar OTP via Supabase Admin (no envía email)
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkErr) {
    return res.status(500).json({ error: 'Error al generar código: ' + linkErr.message });
  }

  const otp = linkData.properties?.email_otp;
  if (!otp) {
    return res.status(500).json({ error: 'No se pudo obtener el código OTP' });
  }

  const userLang = profile.preferred_lang || lang;
  const firstName = (profile.full_name || '').split(' ')[0] || '';

  const copy = {
    es: { subject: 'Tu código de acceso — GAN System', greeting: `Hola${firstName ? ` ${firstName}` : ''}`,
      body: 'Tu código de acceso a GAN System es:', footer: 'Este código expira en 60 minutos. Si no solicitaste esto, ignora este correo.' },
    en: { subject: 'Your access code — GAN System', greeting: `Hi${firstName ? ` ${firstName}` : ''}`,
      body: 'Your GAN System access code is:', footer: 'This code expires in 60 minutes. If you did not request this, please ignore this email.' },
    pt: { subject: 'O seu código de acesso — GAN System', greeting: `Olá${firstName ? ` ${firstName}` : ''}`,
      body: 'O seu código de acesso ao GAN System é:', footer: 'Este código expira em 60 minutos. Se não solicitou isto, ignore este e-mail.' },
    fr: { subject: 'Votre code d\'accès — GAN System', greeting: `Bonjour${firstName ? ` ${firstName}` : ''}`,
      body: 'Votre code d\'accès à GAN System est :', footer: 'Ce code expire dans 60 minutes. Si vous n\'avez pas fait cette demande, ignorez cet e-mail.' },
  };

  const t = copy[userLang] || copy.es;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:2rem 1rem;background:#f1f5f9;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#1e293b,#1a56db);padding:2rem;text-align:center;">
          <div style="color:#fff;font-size:1.5rem;font-weight:800;">GAN <span style="opacity:.7;font-weight:400;">System</span></div>
        </td></tr>
        <tr><td style="padding:2rem 2rem 1rem;">
          <p style="margin:0 0 1rem;color:#334155;font-size:.9375rem;">${t.greeting},</p>
          <p style="margin:0 0 1.5rem;color:#334155;font-size:.9375rem;">${t.body}</p>
          <div style="text-align:center;background:#f8fafc;border-radius:12px;padding:2rem;margin-bottom:1.5rem;border:2px solid #e2e8f0;">
            <span style="font-size:2.5rem;font-weight:800;letter-spacing:.75rem;color:#1a56db;font-family:monospace;">${otp}</span>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:.8rem;text-align:center;">${t.footer}</p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:1.25rem 2rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.78rem;text-align:center;">
          GAN System · https://system.gan.education
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await sendEmail({ to: email, subject: t.subject, html });

  return res.status(200).json({ ok: true });
}
