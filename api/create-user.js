// POST /api/create-user
// Crea un usuario en Supabase Auth y su perfil.
// super_admin: sin límite, puede asignar a cualquier institución.
// institution_admin: máximo 10 usuarios por institución (contando todos los roles).

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Verificar sesión del llamante ──────────────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
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

  // ── 2. Validar institución ────────────────────────────────────────
  const targetInstitutionId = callerProfile.app_role === 'institution_admin'
    ? callerProfile.institution_id   // solo su propia institución
    : institution_id || null;

  // institution_admin: no puede crear super_admin
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

  // ── 4 & 5. Crear usuario + generar link de invitación en un solo paso
  const appUrl = process.env.APP_URL || 'https://system.gan.education';
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type:  'invite',
    email,
    options: {
      data:       { full_name },
      redirectTo: `${appUrl}/pages/set-password.html`,
    },
  });

  if (linkErr) {
    if (linkErr.message?.includes('already registered')) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    return res.status(500).json({ error: 'Error al crear usuario: ' + linkErr.message });
  }

  const newUserId    = linkData.user.id;
  const setPasswordUrl = linkData.properties?.action_link || `${appUrl}/pages/set-password.html`;

  // ── 5. Crear/actualizar perfil ────────────────────────────────────
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

  // ── 7. Email de bienvenida ────────────────────────────────────────
  const copy = {
    es: { subject: 'Bienvenido/a a GAN System', title: '¡Tu cuenta está lista!',
      body: `Hola <strong>${full_name}</strong>,<br><br>
        Se ha creado tu cuenta en <strong>GAN System</strong>. Haz clic en el botón de abajo para establecer tu contraseña y acceder a la plataforma.<br><br>
        Este enlace expira en <strong>24 horas</strong>.`,
      btn: 'Crear mi contraseña' },
    en: { subject: 'Welcome to GAN System', title: 'Your account is ready!',
      body: `Hi <strong>${full_name}</strong>,<br><br>
        Your account on <strong>GAN System</strong> has been created. Click the button below to set your password and access the platform.<br><br>
        This link expires in <strong>24 hours</strong>.`,
      btn: 'Set my password' },
    pt: { subject: 'Bem-vindo/a ao GAN System', title: 'A sua conta está pronta!',
      body: `Olá <strong>${full_name}</strong>,<br><br>
        A sua conta no <strong>GAN System</strong> foi criada. Clique no botão abaixo para definir a sua palavra-passe e aceder à plataforma.<br><br>
        Este link expira em <strong>24 horas</strong>.`,
      btn: 'Criar a minha palavra-passe' },
    fr: { subject: 'Bienvenue sur GAN System', title: 'Votre compte est prêt !',
      body: `Bonjour <strong>${full_name}</strong>,<br><br>
        Votre compte sur <strong>GAN System</strong> a été créé. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à la plateforme.<br><br>
        Ce lien expire dans <strong>24 heures</strong>.`,
      btn: 'Créer mon mot de passe' },
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
            <a href="${setPasswordUrl}" style="background:#1a56db;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
              ${t.btn} →
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
