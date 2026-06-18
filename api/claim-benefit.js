// POST /api/claim-benefit
// Registra el canje de un beneficio y notifica al proveedor por email.

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './_email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Verificar sesión ───────────────────────────────────────────
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido' });

  const { benefit_id } = req.body;
  if (!benefit_id) return res.status(400).json({ error: 'benefit_id requerido' });

  // ── 2. Obtener datos del beneficio ────────────────────────────────
  const { data: benefit, error: bErr } = await supabase
    .from('benefits')
    .select('id, title_es, provider_name, provider_email, code, link, discount_pct')
    .eq('id', benefit_id)
    .single();

  if (bErr || !benefit) return res.status(404).json({ error: 'Beneficio no encontrado' });

  // ── 3. Obtener perfil del usuario ─────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role_title, institutions(name, country)')
    .eq('id', user.id)
    .single();

  // ── 4. Registrar canje (ignora si ya existe) ──────────────────────
  const { error: claimErr } = await supabase
    .from('benefit_claims')
    .insert({ benefit_id, user_id: user.id });

  const alreadyClaimed = claimErr?.code === '23505';
  if (claimErr && !alreadyClaimed) {
    return res.status(500).json({ error: 'Error al registrar el canje' });
  }

  // ── 5. Enviar email de notificación ───────────────────────────────
  if (!alreadyClaimed) {
    const institutionName = profile?.institutions?.name || 'Sin institución';
    const userName        = profile?.full_name || user.email;
    const userEmail       = profile?.email     || user.email;
    const userRole        = profile?.role_title || '—';
    const discountLabel   = benefit.discount_pct != null
      ? (benefit.discount_pct === 0 ? 'Gratuito' : `-${benefit.discount_pct}%`)
      : '';

    const notifyTargets = [];

    // Siempre notificar al super_admin de GAN
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (adminEmail) notifyTargets.push({ to: adminEmail, role: 'GAN Admin' });

    // También notificar al proveedor si tiene email configurado
    if (benefit.provider_email) {
      notifyTargets.push({ to: benefit.provider_email, role: 'Proveedor' });
    }

    const appUrl = process.env.APP_URL || 'https://system.gan.education';

    const subject = `[GAN] Solicitud de beneficio: ${benefit.title_es} — ${userName}`;
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:2rem 1rem;background:#f1f5f9;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#1e293b,#1a56db);padding:2rem;text-align:center;">
          <div style="color:#fff;font-size:1.5rem;font-weight:800;">GAN <span style="opacity:.7;font-weight:400;">System</span></div>
          <div style="color:rgba(255,255,255,.7);font-size:.85rem;margin-top:.25rem;">Notificación de solicitud de beneficio</div>
        </td></tr>
        <tr><td style="padding:2rem 2rem .5rem;border-bottom:1px solid #e2e8f0;">
          <h1 style="margin:0;font-size:1.2rem;color:#1e293b;">Un miembro está interesado en tu beneficio</h1>
        </td></tr>
        <tr><td style="padding:1.5rem 2rem;color:#334155;font-size:.9375rem;line-height:1.7;">
          <p>Un miembro de la red GAN ha solicitado el siguiente beneficio y espera ser contactado:</p>

          <table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:.875rem;">
            <tr style="background:#f8fafc;">
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;width:160px;">Beneficio</td>
              <td style="padding:.6rem .75rem;font-weight:700;">${benefit.title_es} ${discountLabel ? `<span style="color:#1a56db;">(${discountLabel})</span>` : ''}</td>
            </tr>
            <tr>
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;">Proveedor</td>
              <td style="padding:.6rem .75rem;">${benefit.provider_name}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;">Solicitante</td>
              <td style="padding:.6rem .75rem;font-weight:700;">${userName}</td>
            </tr>
            <tr>
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;">Cargo</td>
              <td style="padding:.6rem .75rem;">${userRole}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;">Institución</td>
              <td style="padding:.6rem .75rem;">${institutionName}</td>
            </tr>
            <tr>
              <td style="padding:.6rem .75rem;color:#64748b;font-weight:600;">Email de contacto</td>
              <td style="padding:.6rem .75rem;">
                <a href="mailto:${userEmail}" style="color:#1a56db;font-weight:700;">${userEmail}</a>
              </td>
            </tr>
          </table>

          <div style="background:#eff6ff;border-left:4px solid #1a56db;padding:1rem 1.25rem;border-radius:4px;font-size:.875rem;margin-top:1rem;">
            📬 <strong>Acción requerida:</strong> Por favor comunícate con <strong>${userName}</strong>
            al correo <a href="mailto:${userEmail}" style="color:#1a56db;">${userEmail}</a>
            para coordinar el acceso al beneficio.
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:1.25rem 2rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.78rem;text-align:center;">
          Global Academic Network · <a href="${appUrl}" style="color:#94a3b8;">${appUrl}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    await Promise.all(
      notifyTargets.map(t => sendEmail({ to: t.to, subject, html }))
    );
  }

  return res.status(200).json({ ok: true, alreadyClaimed });
}
