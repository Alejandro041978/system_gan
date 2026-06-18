// POST /api/create-user
// Crea un usuario en Supabase Auth y su perfil. Envía email de bienvenida.
// super_admin: sin límite, puede asignar a cualquier institución.
// institution_admin: máximo 10 usuarios por institución.

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Verificar sesión del llamante ──────────────────────────────
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !caller) return res.status(401).json({ error: 'Token inválido' });

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('app_role, institution_id')
    .eq('id', caller.id)
    .single();

  if (!callerProfile || !['super_admin', 'institution_admin'].includes(callerProfile.app_role)) {
    return res.status(403).json({ error: 'Sin permisos para crear usuarios' });
  }

  const { full_name, email, role_title, app_role = 'member', institution_id, lang = 'es' } = req.body;
  if (!full_name || !email) return res.status(400).json({ error: 'Nombre y email son obligatorios' });

  // ── 2. Validar institución y permisos ─────────────────────────────
  const targetInstitutionId = callerProfile.app_role === 'institution_admin'
    ? callerProfile.institution_id
    : institution_id || null;

  if (callerProfile.app_role === 'institution_admin' && app_role === 'super_admin') {
    return res.status(403).json({ error: 'No puedes asignar el rol super_admin' });
  }

  // ── 3. Límite de 10 usuarios para institution_admin ───────────────
  if (callerProfile.app_role === 'institution_admin') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', targetInstitutionId);

    if ((count || 0) >= 10) {
      return res.status(400).json({ error: 'Has alcanzado el límite de 10 usuarios para tu institución' });
    }
  }

  // ── 4. Crear usuario (sin contraseña, acceso por OTP) ─────────────
  const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createErr) {
    if (createErr.message?.includes('already registered')) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    return res.status(500).json({ error: 'Error al crear usuario: ' + createErr.message });
  }

  const newUserId = userData.user.id;

  // ── 5. Crear perfil ───────────────────────────────────────────────
  await supabase.from('profiles').upsert({
    id:             newUserId,
    full_name,
    email,
    role_title:     role_title || null,
    app_role,
    institution_id: targetInstitutionId || null,
    preferred_lang: lang,
    is_visible:     true,
  });

  // ── 6. Email de bienvenida ────────────────────────────────────────
  const appUrl = process.env.APP_URL || 'https://system.gan.education';
  const copy = {
    es: { subject: 'Bienvenido/a a GAN System', title: '¡Tu cuenta está lista!',
      body: `Hola <strong>${full_name}</strong>,<br><br>
        Se ha creado tu cuenta en <strong>GAN System</strong>.<br><br>
        Para acceder, ve a <a href="${appUrl}/pages/login.html">${appUrl}/pages/login.html</a>, ingresa tu correo electrónico y recibirás un código de 6 dígitos para entrar. Sin contraseña.` },
    en: { subject: 'Welcome to GAN System', title: 'Your account is ready!',
      body: `Hi <strong>${full_name}</strong>,<br><br>
        Your account on <strong>GAN System</strong> has been created.<br><br>
        To access, go to <a href="${appUrl}/pages/login.html">${appUrl}/pages/login.html</a>, enter your email and you will receive a 6-digit code to sign in. No password needed.` },
    pt: { subject: 'Bem-vindo/a ao GAN System', title: 'A sua conta está pronta!',
      body: `Olá <strong>${full_name}</strong>,<br><br>
        A sua conta no <strong>GAN System</strong> foi criada.<br><br>
        Para aceder, vá a <a href="${appUrl}/pages/login.html">${appUrl}/pages/login.html</a>, insira o seu e-mail e receberá um código de 6 dígitos para entrar. Sem palavra-passe.` },
    fr: { subject: 'Bienvenue sur GAN System', title: 'Votre compte est prêt !',
      body: `Bonjour <strong>${full_name}</strong>,<br><br>
        Votre compte sur <strong>GAN System</strong> a été créé.<br><br>
        Pour accéder, rendez-vous sur <a href="${appUrl}/pages/login.html">${appUrl}/pages/login.html</a>, saisissez votre e-mail et vous recevrez un code à 6 chiffres pour vous connecter. Sans mot de passe.` },
  };

  const t = copy[lang] || copy.es;
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:2rem 1rem;background:#f1f5f9;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#1e293b,#1a56db);padding:2rem;text-align:center;">
          <div style="color:#fff;font-size:1.5rem;font-weight:800;">GAN <span style="opacity:.7;font-weight:400;">System</span></div>
        </td></tr>
        <tr><td style="padding:2rem 2rem .5rem;border-bottom:1px solid #e2e8f0;">
          <h1 style="margin:0;font-size:1.25rem;color:#1e293b;">${t.title}</h1>
        </td></tr>
        <tr><td style="padding:1.5rem 2rem;color:#334155;font-size:.9375rem;line-height:1.7;">
          <p>${t.body}</p>
          <div style="text-align:center;margin:1.5rem 0;">
            <a href="${appUrl}/pages/login.html" style="background:#1a56db;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
              Acceder a GAN System →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:1.25rem 2rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.78rem;text-align:center;">
          GAN System · https://system.gan.education
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await sendEmail({ to: email, subject: t.subject, html });

  return res.status(200).json({ ok: true, userId: newUserId });
}
