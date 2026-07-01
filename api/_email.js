// Helper de envío de emails via Resend
// Requiere variable de entorno: RESEND_API_KEY
// Requiere variable de entorno: EMAIL_FROM  (ej: "GAN System <noreply@tudominio.com>")
// Requiere variable de entorno: SUPER_ADMIN_EMAIL (ej: "admin@balticec.com")

const RESEND_API = 'https://api.resend.com/emails';

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY no configurado — email omitido');
    return { ok: false, reason: 'no_api_key' };
  }

  const from = process.env.EMAIL_FROM || 'GAN System <noreply@gan-system.com>';

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[email] Resend error:', err);
    return { ok: false, reason: err };
  }

  return { ok: true };
}

// ── Templates ────────────────────────────────────────────────────────────────

export function tplConfirmation({ institution_name, contact_name, lang = 'es' }) {
  const copy = {
    es: {
      subject: `GAN System — Postulación recibida: ${institution_name}`,
      title: 'Hemos recibido tu postulación',
      body: `Estimado/a <strong>${contact_name}</strong>,<br><br>
        Tu postulación para que <strong>${institution_name}</strong> forme parte de la
        GAN System ha sido recibida exitosamente.<br><br>
        Nuestro equipo revisará tu expediente durante los próximos <strong>3 días hábiles</strong>
        y te notificaremos el resultado por este mismo correo.<br><br>
        Gracias por tu interés en unirte a la red.`,
      footer: 'Si tienes alguna consulta, responde a este correo.',
    },
    en: {
      subject: `GAN System — Application received: ${institution_name}`,
      title: 'We have received your application',
      body: `Dear <strong>${contact_name}</strong>,<br><br>
        Your application for <strong>${institution_name}</strong> to join the
        GAN System has been received successfully.<br><br>
        Our team will review your application within the next <strong>3 business days</strong>
        and will notify you of the outcome at this email address.<br><br>
        Thank you for your interest in joining the network.`,
      footer: 'If you have any questions, reply to this email.',
    },
    pt: {
      subject: `GAN System — Candidatura recebida: ${institution_name}`,
      title: 'Recebemos a sua candidatura',
      body: `Caro/a <strong>${contact_name}</strong>,<br><br>
        A candidatura de <strong>${institution_name}</strong> para fazer parte da
        GAN System foi recebida com sucesso.<br><br>
        Nossa equipa irá analisar o seu processo nos próximos <strong>3 dias úteis</strong>
        e irá notificá-lo/a do resultado por este e-mail.<br><br>
        Obrigado pelo seu interesse em aderir à rede.`,
      footer: 'Se tiver alguma dúvida, responda a este e-mail.',
    },
    fr: {
      subject: `GAN System — Candidature reçue : ${institution_name}`,
      title: 'Nous avons reçu votre candidature',
      body: `Cher/Chère <strong>${contact_name}</strong>,<br><br>
        Votre candidature pour que <strong>${institution_name}</strong> rejoigne le
        Réseau Académique Mondial (GAN) a été reçue avec succès.<br><br>
        Notre équipe examinera votre dossier dans les <strong>3 jours ouvrables</strong> à venir
        et vous informera du résultat par ce même e-mail.<br><br>
        Nous vous remercions de l'intérêt que vous portez au réseau.`,
      footer: 'Si vous avez des questions, répondez à cet e-mail.',
    },
  };

  const t = copy[lang] || copy.es;
  return {
    subject: t.subject,
    html: emailLayout({ title: t.title, body: t.body, footer: t.footer }),
  };
}

export function tplAdminNotification({ institution_name, contact_name, contact_email, country, ai_score, ai_decision, ai_justification, app_id, adminUrl }) {
  const decisionLabel = { approved: '✅ Aprobada', rejected: '❌ Rechazada', review: '⏳ Requiere revisión' };
  const decisionColor = { approved: '#0e9f6e', rejected: '#e02424', review: '#d97706' };

  const subject = `[GAN] Nueva postulación — ${institution_name} (${decisionLabel[ai_decision] || ai_decision})`;
  const html = emailLayout({
    title: 'Nueva postulación recibida',
    body: `
      <p>Se ha recibido una nueva postulación y la IA la ha evaluado:</p>

      <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
        <tr><td style="padding:.5rem;color:#64748b;width:160px;">Institución</td><td style="padding:.5rem;font-weight:700;">${institution_name}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:.5rem;color:#64748b;">País</td><td style="padding:.5rem;">${country}</td></tr>
        <tr><td style="padding:.5rem;color:#64748b;">Contacto</td><td style="padding:.5rem;">${contact_name} &lt;${contact_email}&gt;</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:.5rem;color:#64748b;">Puntaje IA</td><td style="padding:.5rem;font-weight:700;font-size:1.1rem;">${ai_score}/100</td></tr>
        <tr><td style="padding:.5rem;color:#64748b;">Decisión IA</td><td style="padding:.5rem;">
          <span style="color:${decisionColor[ai_decision]};font-weight:700;">${decisionLabel[ai_decision] || ai_decision}</span>
        </td></tr>
      </table>

      <p style="background:#eff6ff;border-left:4px solid #1a56db;padding:1rem;border-radius:4px;font-size:.9rem;line-height:1.6;">
        <strong>Justificación IA:</strong><br>${ai_justification}
      </p>

      <p style="color:#64748b;font-size:.875rem;">
        ⚠️ <strong>La notificación al postulante se enviará automáticamente en 68 horas.</strong><br>
        Puedes cambiar la decisión antes de ese plazo desde el panel de administración.
      </p>

      <div style="text-align:center;margin:1.5rem 0;">
        <a href="${adminUrl}" style="background:#1a56db;color:#fff;padding:.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
          Ver postulación en el panel →
        </a>
      </div>
    `,
    footer: 'Este correo es automático. No respondas a este mensaje.',
  });

  return { subject, html };
}

export function tplDecisionNotification({ institution_name, contact_name, final_decision, ai_justification, lang = 'es' }) {
  const decisionCopy = {
    approved: {
      es: { title: '¡Tu postulación ha sido aprobada! 🎉', intro: 'Nos complace informarte que', msg: 'ha sido <strong>aceptada como miembro de GAN</strong>. En los próximos días recibirás las instrucciones de acceso a la plataforma y a todos los beneficios de la red.', color: '#0e9f6e' },
      en: { title: 'Your application has been approved! 🎉', intro: 'We are pleased to inform you that', msg: 'has been <strong>accepted as a GAN member</strong>. In the coming days you will receive access instructions for the platform and all network benefits.', color: '#0e9f6e' },
      pt: { title: 'A sua candidatura foi aprovada! 🎉', intro: 'Temos o prazer de informar que', msg: 'foi <strong>aceite como membro da GAN</strong>. Nos próximos dias receberá as instruções de acesso à plataforma e a todos os benefícios da rede.', color: '#0e9f6e' },
      fr: { title: 'Votre candidature a été approuvée ! 🎉', intro: 'Nous avons le plaisir de vous informer que', msg: 'a été <strong>acceptée en tant que membre de GAN</strong>. Dans les prochains jours, vous recevrez les instructions d\'accès à la plateforme et à tous les avantages du réseau.', color: '#0e9f6e' },
    },
    rejected: {
      es: { title: 'Resultado de tu postulación a GAN', intro: 'Lamentamos informarte que la postulación de', msg: '<strong>no ha sido aprobada</strong> en esta ocasión. Te animamos a seguir fortaleciendo tu institución y volver a postular en el futuro.', color: '#e02424' },
      en: { title: 'Result of your GAN application', intro: 'We regret to inform you that the application of', msg: 'has <strong>not been approved</strong> on this occasion. We encourage you to continue strengthening your institution and apply again in the future.', color: '#e02424' },
      pt: { title: 'Resultado da sua candidatura à GAN', intro: 'Lamentamos informar que a candidatura de', msg: '<strong>não foi aprovada</strong> nesta ocasião. Encorajamo-lo/a a continuar a fortalecer a sua instituição e a candidatar-se novamente no futuro.', color: '#e02424' },
      fr: { title: 'Résultat de votre candidature à GAN', intro: 'Nous regrettons de vous informer que la candidature de', msg: 'n\'a <strong>pas été approuvée</strong> lors de cette session. Nous vous encourageons à continuer à renforcer votre institution et à postuler à nouveau à l\'avenir.', color: '#e02424' },
    },
    review: {
      es: { title: 'Tu postulación está en revisión adicional', intro: 'La postulación de', msg: 'ha sido <strong>marcada para revisión adicional</strong> por nuestro comité académico. Nos pondremos en contacto contigo a la brevedad con más información.', color: '#d97706' },
      en: { title: 'Your application is under additional review', intro: 'The application of', msg: 'has been <strong>flagged for additional review</strong> by our academic committee. We will contact you shortly with more information.', color: '#d97706' },
      pt: { title: 'A sua candidatura está em revisão adicional', intro: 'A candidatura de', msg: 'foi <strong>assinalada para revisão adicional</strong> pelo nosso comité académico. Entraremos em contacto consigo brevemente com mais informações.', color: '#d97706' },
      fr: { title: 'Votre candidature est en cours de révision supplémentaire', intro: 'La candidature de', msg: 'a été <strong>signalée pour révision supplémentaire</strong> par notre comité académique. Nous vous contacterons prochainement avec plus d\'informations.', color: '#d97706' },
    },
  };

  const decisions = decisionCopy[final_decision] || decisionCopy.review;
  const t = decisions[lang] || decisions.es;
  const subjects = {
    es: { approved: `¡Bienvenida a GAN! ${institution_name} ha sido aprobada`, rejected: `GAN — Resultado de postulación: ${institution_name}`, review: `GAN — Tu postulación requiere revisión adicional` },
    en: { approved: `Welcome to GAN! ${institution_name} has been approved`, rejected: `GAN — Application result: ${institution_name}`, review: `GAN — Your application requires additional review` },
    pt: { approved: `Bem-vindo à GAN! ${institution_name} foi aprovada`, rejected: `GAN — Resultado da candidatura: ${institution_name}`, review: `GAN — A sua candidatura requer revisão adicional` },
    fr: { approved: `Bienvenue dans GAN ! ${institution_name} a été approuvée`, rejected: `GAN — Résultat de candidature : ${institution_name}`, review: `GAN — Votre candidature nécessite une révision supplémentaire` },
  };

  const langSubs = subjects[lang] || subjects.es;
  const subject  = langSubs[final_decision] || langSubs.review;

  const html = emailLayout({
    title: t.title,
    accentColor: t.color,
    body: `
      <p>Estimado/a <strong>${contact_name}</strong>,</p>
      <p>${t.intro} <strong>${institution_name}</strong> ${t.msg}</p>
      ${ai_justification ? `
      <div style="background:#f8fafc;border-left:4px solid ${t.color};padding:1rem;border-radius:4px;font-size:.9rem;line-height:1.6;margin:1rem 0;">
        <strong>Evaluación del comité:</strong><br>${ai_justification}
      </div>` : ''}
    `,
    footer: 'GAN System · gan-system.com',
  });

  return { subject, html };
}

export function tplOnboarding({ institution_name, contact_name, lang = 'es' }) {
  const appUrl = process.env.APP_URL || 'https://system.gan.education';
  const loginUrl = `${appUrl}/pages/login.html`;
  const portalUrl = `${appUrl}/pages/portal.html`;
  const dirUrl = `${appUrl}/pages/directorio.html`;

  const copy = {
    es: {
      subject: `¡Bienvenido/a a GAN System, ${institution_name}!`,
      title: '¡Ya eres parte de la red GAN! 🎓',
      greeting: `Estimado/a <strong>${contact_name}</strong>,`,
      intro: `<strong>${institution_name}</strong> ya es miembro oficial de la <strong>Global Academic Network (GAN)</strong>. Aquí te explicamos cómo aprovechar al máximo tu membresía:`,
      steps: [
        { icon: '🔑', title: 'Accede a la plataforma', desc: `Ve a <a href="${loginUrl}" style="color:#1a56db;">${loginUrl}</a>, ingresa tu correo y recibirás un código de 6 dígitos para entrar. Sin contraseña.` },
        { icon: '👥', title: 'Registra a tu equipo', desc: `Desde el <strong>Panel de tu Institución</strong> puedes crear cuentas para los miembros de tu equipo (hasta 10 usuarios). Cada uno recibirá un email de bienvenida con acceso inmediato al directorio de miembros GAN.` },
        { icon: '🎁', title: 'Accede a los beneficios', desc: `En el <a href="${portalUrl}" style="color:#1a56db;">Portal de Beneficios</a> encontrarás descuentos exclusivos en software, cursos, títulos internacionales, viajes de estudio y más — disponibles para tu institución y sus estudiantes.` },
        { icon: '🌐', title: 'Conecta con la red', desc: `En el <a href="${dirUrl}" style="color:#1a56db;">Directorio de Miembros</a> puedes conocer a los representantes de todas las instituciones GAN y contactarlos directamente.` },
      ],
      cta: 'Acceder a GAN System →',
      footer: '¿Tienes preguntas? Responde a este correo y te ayudaremos. · GAN System · system.gan.education',
    },
    en: {
      subject: `Welcome to GAN System, ${institution_name}!`,
      title: 'You are now part of the GAN network! 🎓',
      greeting: `Dear <strong>${contact_name}</strong>,`,
      intro: `<strong>${institution_name}</strong> is now an official member of the <strong>Global Academic Network (GAN)</strong>. Here is how to make the most of your membership:`,
      steps: [
        { icon: '🔑', title: 'Access the platform', desc: `Go to <a href="${loginUrl}" style="color:#1a56db;">${loginUrl}</a>, enter your email and you will receive a 6-digit code to log in. No password needed.` },
        { icon: '👥', title: 'Register your team', desc: `From your <strong>Institution Panel</strong> you can create accounts for your team members (up to 10 users). Each one will receive a welcome email with immediate access to the GAN member directory.` },
        { icon: '🎁', title: 'Access the benefits', desc: `In the <a href="${portalUrl}" style="color:#1a56db;">Benefits Portal</a> you will find exclusive discounts on software, courses, international degrees, study trips and more — available for your institution and its students.` },
        { icon: '🌐', title: 'Connect with the network', desc: `In the <a href="${dirUrl}" style="color:#1a56db;">Member Directory</a> you can meet representatives from all GAN institutions and contact them directly.` },
      ],
      cta: 'Access GAN System →',
      footer: 'Questions? Reply to this email and we will help you. · GAN System · system.gan.education',
    },
    pt: {
      subject: `Bem-vindo/a ao GAN System, ${institution_name}!`,
      title: 'Já faz parte da rede GAN! 🎓',
      greeting: `Caro/a <strong>${contact_name}</strong>,`,
      intro: `<strong>${institution_name}</strong> já é membro oficial da <strong>Global Academic Network (GAN)</strong>. Veja como aproveitar ao máximo a sua adesão:`,
      steps: [
        { icon: '🔑', title: 'Aceda à plataforma', desc: `Vá a <a href="${loginUrl}" style="color:#1a56db;">${loginUrl}</a>, insira o seu e-mail e receberá um código de 6 dígitos para entrar. Sem senha.` },
        { icon: '👥', title: 'Registe a sua equipa', desc: `A partir do <strong>Painel da sua Instituição</strong> pode criar contas para os membros da sua equipa (até 10 utilizadores). Cada um receberá um e-mail de boas-vindas com acesso imediato ao diretório de membros GAN.` },
        { icon: '🎁', title: 'Aceda aos benefícios', desc: `No <a href="${portalUrl}" style="color:#1a56db;">Portal de Benefícios</a> encontrará descontos exclusivos em software, cursos, títulos internacionais, viagens de estudo e mais.` },
        { icon: '🌐', title: 'Conecte-se com a rede', desc: `No <a href="${dirUrl}" style="color:#1a56db;">Diretório de Membros</a> pode conhecer os representantes de todas as instituições GAN e contactá-los diretamente.` },
      ],
      cta: 'Aceder ao GAN System →',
      footer: 'Dúvidas? Responda a este e-mail. · GAN System · system.gan.education',
    },
    fr: {
      subject: `Bienvenue sur GAN System, ${institution_name} !`,
      title: 'Vous faites désormais partie du réseau GAN ! 🎓',
      greeting: `Cher/Chère <strong>${contact_name}</strong>,`,
      intro: `<strong>${institution_name}</strong> est désormais membre officiel du <strong>Réseau Académique Mondial (GAN)</strong>. Voici comment tirer le meilleur parti de votre adhésion :`,
      steps: [
        { icon: '🔑', title: 'Accédez à la plateforme', desc: `Rendez-vous sur <a href="${loginUrl}" style="color:#1a56db;">${loginUrl}</a>, saisissez votre e-mail et vous recevrez un code à 6 chiffres pour vous connecter. Sans mot de passe.` },
        { icon: '👥', title: 'Inscrivez votre équipe', desc: `Depuis votre <strong>Panneau Institutionnel</strong>, vous pouvez créer des comptes pour les membres de votre équipe (jusqu'à 10 utilisateurs). Chacun recevra un e-mail de bienvenue avec accès immédiat à l'annuaire des membres GAN.` },
        { icon: '🎁', title: 'Accédez aux avantages', desc: `Sur le <a href="${portalUrl}" style="color:#1a56db;">Portail des Avantages</a> vous trouverez des réductions exclusives sur des logiciels, cours, diplômes internationaux, voyages d'études et plus encore.` },
        { icon: '🌐', title: 'Connectez-vous au réseau', desc: `Dans l'<a href="${dirUrl}" style="color:#1a56db;">Annuaire des Membres</a> vous pouvez rencontrer les représentants de toutes les institutions GAN et les contacter directement.` },
      ],
      cta: 'Accéder à GAN System →',
      footer: 'Des questions ? Répondez à cet e-mail. · GAN System · system.gan.education',
    },
  };

  const t = copy[lang] || copy.es;

  const stepsHtml = t.steps.map(s => `
    <tr><td style="padding:.75rem 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:1.5rem;width:40px;vertical-align:top;padding-top:2px;">${s.icon}</td>
        <td style="padding-left:.75rem;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:.2rem;">${s.title}</div>
          <div style="color:#475569;font-size:.875rem;line-height:1.6;">${s.desc}</div>
        </td>
      </tr></table>
    </td></tr>
  `).join('');

  const body = `
    <p>${t.greeting}</p>
    <p>${t.intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:1.25rem 0;">
      ${stepsHtml}
    </table>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="${loginUrl}" style="background:#1a56db;color:#fff;padding:.85rem 2.5rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">${t.cta}</a>
    </div>
  `;

  return {
    subject: t.subject,
    html: emailLayout({ title: t.title, body, footer: t.footer }),
  };
}

// ── Layout base ──────────────────────────────────────────────────────────────
function emailLayout({ title, body, footer, accentColor = '#1a56db' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:2rem 1rem;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e293b,${accentColor});padding:2rem;text-align:center;">
          <div style="color:#fff;font-size:1.5rem;font-weight:800;letter-spacing:-.02em;">GAN <span style="opacity:.7;font-weight:400;">Network</span></div>
          <div style="color:rgba(255,255,255,.7);font-size:.8rem;margin-top:.25rem;">GAN System</div>
        </td></tr>
        <!-- Title -->
        <tr><td style="padding:2rem 2rem .5rem;border-bottom:1px solid #e2e8f0;">
          <h1 style="margin:0;font-size:1.25rem;color:#1e293b;font-weight:700;">${title}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:1.5rem 2rem;color:#334155;font-size:.9375rem;line-height:1.7;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:1.25rem 2rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.78rem;text-align:center;">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
