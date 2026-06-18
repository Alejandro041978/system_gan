// GAN Platform — Sistema de internacionalización (ES/EN/PT/FR)
const TRANSLATIONS = {
  es: {
    // Nav
    nav_apply: 'Postular',
    nav_login: 'Acceder',
    nav_portal: 'Beneficios',
    nav_directory: 'Directorio',
    nav_admin: 'Mi Institución',
    nav_logout: 'Cerrar sesión',

    // Landing
    hero_title: 'Red Global de Universidades GAN',
    hero_subtitle: 'Conectamos instituciones de educación superior para compartir beneficios, conocimiento y oportunidades para estudiantes y docentes.',
    hero_cta: 'Postular institución',
    hero_login: 'Acceder a beneficios',

    // Postulación
    apply_title: 'Postulación de Membresía',
    apply_subtitle: 'Complete el formulario. La IA evaluará su postulación con base en la rúbrica GAN.',
    section_institution: 'Datos de la Institución',
    section_contact: 'Contacto Principal',
    section_metrics: 'Métricas Institucionales',
    section_motivation: 'Motivación y Propósito',
    section_activities: 'Actividades a Desarrollar con GAN',

    field_inst_name: 'Nombre de la institución',
    field_country: 'País',
    field_inst_type: 'Tipo de institución',
    field_website: 'Sitio web',
    field_founded: 'Año de fundación',
    field_contact_name: 'Nombre completo',
    field_contact_role: 'Cargo',
    field_contact_email: 'Correo electrónico',
    field_contact_phone: 'Teléfono',
    field_students: 'Número de estudiantes',
    field_programs: 'Programas académicos',
    field_accreditations: 'Acreditaciones nacionales e internacionales',
    field_motivation: '¿Por qué desean unirse a GAN y qué aportarían?',

    type_university: 'Universidad',
    type_institute: 'Instituto',
    type_college: 'Colegio universitario',
    type_other: 'Otro',

    act_teacher_exchange: 'Intercambio de docentes',
    act_student_exchange: 'Intercambio de estudiantes',
    act_language_courses: 'Cursos de idiomas',
    act_certifications: 'Certificaciones complementarias',
    act_scholarships: 'Becas',
    act_study_trips: 'Viajes de estudio',
    act_dual_degree: 'Doble grado',
    act_credit_transfer: 'Convalidaciones',
    act_other: 'Otros',

    rubric_title: 'Rúbrica de Evaluación GAN',
    rubric_accreditation: 'Acreditaciones (40%)',
    rubric_motivation: 'Motivación y actividades (30%)',
    rubric_institution: 'Datos institucionales (20%)',
    rubric_contact: 'Contacto y seriedad (10%)',
    rubric_min_score: 'Puntaje mínimo de aprobación: 70/100',

    btn_submit: 'Enviar postulación',
    btn_submitting: 'Evaluando con IA...',

    result_approved_title: '¡Postulación Aprobada!',
    result_approved_msg: 'Felicitaciones. Su institución ha sido aprobada como miembro GAN. Recibirá un correo con las instrucciones de acceso.',
    result_rejected_title: 'Postulación No Aprobada',
    result_rejected_msg: 'Lamentablemente su postulación no alcanzó el puntaje mínimo requerido. A continuación la evaluación detallada:',
    result_review_title: 'En Revisión',
    result_review_msg: 'Su postulación será revisada manualmente por el equipo GAN. Le contactaremos a la brevedad.',
    result_score: 'Puntaje obtenido',

    // Login
    login_title: 'Acceder a GAN Platform',
    login_email: 'Correo electrónico',
    login_password: 'Contraseña',
    login_btn: 'Ingresar',
    login_forgot: '¿Olvidaste tu contraseña?',
    login_error: 'Credenciales incorrectas. Intente nuevamente.',

    // Admin
    admin_title: 'Mi Institución',
    admin_users_title: 'Gestión de Usuarios',
    admin_users_subtitle: 'Puede crear hasta 5 usuarios para su institución.',
    admin_add_user: 'Agregar usuario',
    admin_edit_user: 'Editar usuario',
    admin_delete_user: 'Eliminar usuario',
    admin_users_limit: 'Ha alcanzado el límite de 5 usuarios.',
    admin_name: 'Nombre',
    admin_email: 'Correo',
    admin_role_title: 'Cargo',
    admin_save: 'Guardar',
    admin_cancel: 'Cancelar',
    admin_confirm_delete: '¿Eliminar este usuario?',

    // Portal
    portal_title: 'Beneficios GAN',
    portal_subtitle: 'Descuentos y beneficios exclusivos para miembros GAN.',
    portal_filter_all: 'Todos',
    portal_filter_software: 'Software',
    portal_filter_courses: 'Cursos',
    portal_filter_titles: 'Títulos',
    portal_filter_travel: 'Viajes',
    portal_filter_books: 'Libros',
    portal_filter_events: 'Eventos',
    portal_filter_other: 'Otros',
    portal_discount: 'descuento',
    portal_claim: 'Obtener beneficio',
    portal_claimed: 'Ya canjeado',
    portal_code_label: 'Tu código:',
    portal_link_label: 'Acceder al beneficio',
    portal_expires: 'Válido hasta',
    portal_unlimited: 'Sin límite',
    portal_available: 'disponibles',

    // Directorio
    dir_title: 'Directorio de Miembros',
    dir_subtitle: 'Conoce a los miembros de la red GAN.',
    dir_filter_country: 'País',
    dir_filter_institution: 'Institución',
    dir_all_countries: 'Todos los países',
    dir_all_institutions: 'Todas las instituciones',
    dir_contact: 'Contactar',
    dir_linkedin: 'LinkedIn',
    dir_no_results: 'No se encontraron miembros con los filtros seleccionados.',

    // Errores generales
    error_required: 'Este campo es obligatorio.',
    error_email: 'Ingrese un correo válido.',
    error_generic: 'Ocurrió un error. Intente nuevamente.',
    error_session: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
  },

  en: {
    nav_apply: 'Apply',
    nav_login: 'Login',
    nav_portal: 'Beneficios',
    nav_directory: 'Directory',
    nav_admin: 'My Institution',
    nav_logout: 'Log out',

    hero_title: 'GAN Global University Network',
    hero_subtitle: 'Connecting higher education institutions to share benefits, knowledge, and opportunities for students and faculty.',
    hero_cta: 'Apply for membership',
    hero_login: 'Access benefits',

    apply_title: 'Membership Application',
    apply_subtitle: 'Fill out the form. AI will evaluate your application based on the GAN rubric.',
    section_institution: 'Institution Details',
    section_contact: 'Primary Contact',
    section_metrics: 'Institutional Metrics',
    section_motivation: 'Motivation & Purpose',
    section_activities: 'Activities to Develop with GAN',

    field_inst_name: 'Institution name',
    field_country: 'Country',
    field_inst_type: 'Institution type',
    field_website: 'Website',
    field_founded: 'Year founded',
    field_contact_name: 'Full name',
    field_contact_role: 'Position',
    field_contact_email: 'Email address',
    field_contact_phone: 'Phone',
    field_students: 'Number of students',
    field_programs: 'Academic programs',
    field_accreditations: 'National and international accreditations',
    field_motivation: 'Why do you want to join GAN and what would you contribute?',

    type_university: 'University',
    type_institute: 'Institute',
    type_college: 'College',
    type_other: 'Other',

    act_teacher_exchange: 'Teacher exchange',
    act_student_exchange: 'Student exchange',
    act_language_courses: 'Language courses',
    act_certifications: 'Complementary certifications',
    act_scholarships: 'Scholarships',
    act_study_trips: 'Study trips',
    act_dual_degree: 'Dual degree',
    act_credit_transfer: 'Credit transfer',
    act_other: 'Others',

    rubric_title: 'GAN Evaluation Rubric',
    rubric_accreditation: 'Accreditations (40%)',
    rubric_motivation: 'Motivation and activities (30%)',
    rubric_institution: 'Institutional data (20%)',
    rubric_contact: 'Contact and seriousness (10%)',
    rubric_min_score: 'Minimum approval score: 70/100',

    btn_submit: 'Submit application',
    btn_submitting: 'AI evaluating...',

    result_approved_title: 'Application Approved!',
    result_approved_msg: 'Congratulations. Your institution has been approved as a GAN member. You will receive an email with access instructions.',
    result_rejected_title: 'Application Not Approved',
    result_rejected_msg: 'Unfortunately your application did not reach the minimum required score. Below is the detailed evaluation:',
    result_review_title: 'Under Review',
    result_review_msg: 'Your application will be manually reviewed by the GAN team. We will contact you shortly.',
    result_score: 'Score obtained',

    login_title: 'Access GAN Platform',
    login_email: 'Email address',
    login_password: 'Password',
    login_btn: 'Log in',
    login_forgot: 'Forgot your password?',
    login_error: 'Incorrect credentials. Please try again.',

    admin_title: 'My Institution',
    admin_users_title: 'User Management',
    admin_users_subtitle: 'You can create up to 5 users for your institution.',
    admin_add_user: 'Add user',
    admin_edit_user: 'Edit user',
    admin_delete_user: 'Delete user',
    admin_users_limit: 'You have reached the 5-user limit.',
    admin_name: 'Name',
    admin_email: 'Email',
    admin_role_title: 'Position',
    admin_save: 'Save',
    admin_cancel: 'Cancel',
    admin_confirm_delete: 'Delete this user?',

    portal_title: 'GAN Benefits',
    portal_subtitle: 'Exclusive discounts and benefits for GAN members.',
    portal_filter_all: 'All',
    portal_filter_software: 'Software',
    portal_filter_courses: 'Courses',
    portal_filter_titles: 'Degrees',
    portal_filter_travel: 'Travel',
    portal_filter_books: 'Books',
    portal_filter_events: 'Events',
    portal_filter_other: 'Other',
    portal_discount: 'discount',
    portal_claim: 'Get benefit',
    portal_claimed: 'Already claimed',
    portal_code_label: 'Your code:',
    portal_link_label: 'Access benefit',
    portal_expires: 'Valid until',
    portal_unlimited: 'Unlimited',
    portal_available: 'available',

    dir_title: 'Member Directory',
    dir_subtitle: 'Meet the members of the GAN network.',
    dir_filter_country: 'Country',
    dir_filter_institution: 'Institution',
    dir_all_countries: 'All countries',
    dir_all_institutions: 'All institutions',
    dir_contact: 'Contact',
    dir_linkedin: 'LinkedIn',
    dir_no_results: 'No members found with the selected filters.',

    error_required: 'This field is required.',
    error_email: 'Enter a valid email.',
    error_generic: 'An error occurred. Please try again.',
    error_session: 'Your session has expired. Please log in again.',
  },

  pt: {
    nav_apply: 'Candidatar',
    nav_login: 'Entrar',
    nav_portal: 'Beneficios',
    nav_directory: 'Diretório',
    nav_admin: 'Minha Instituição',
    nav_logout: 'Sair',

    hero_title: 'Rede Global de Universidades GAN',
    hero_subtitle: 'Conectamos instituições de ensino superior para compartilhar benefícios, conhecimento e oportunidades para estudantes e docentes.',
    hero_cta: 'Candidatar instituição',
    hero_login: 'Acessar benefícios',

    apply_title: 'Candidatura de Membro',
    apply_subtitle: 'Preencha o formulário. A IA avaliará sua candidatura com base na rubrica GAN.',
    section_institution: 'Dados da Instituição',
    section_contact: 'Contato Principal',
    section_metrics: 'Métricas Institucionais',
    section_motivation: 'Motivação e Propósito',
    section_activities: 'Atividades a Desenvolver com a GAN',

    field_inst_name: 'Nome da instituição',
    field_country: 'País',
    field_inst_type: 'Tipo de instituição',
    field_website: 'Site',
    field_founded: 'Ano de fundação',
    field_contact_name: 'Nome completo',
    field_contact_role: 'Cargo',
    field_contact_email: 'E-mail',
    field_contact_phone: 'Telefone',
    field_students: 'Número de estudantes',
    field_programs: 'Programas acadêmicos',
    field_accreditations: 'Acreditações nacionais e internacionais',
    field_motivation: 'Por que desejam entrar na GAN e o que contribuiriam?',

    type_university: 'Universidade',
    type_institute: 'Instituto',
    type_college: 'Faculdade',
    type_other: 'Outro',

    act_teacher_exchange: 'Intercâmbio de docentes',
    act_student_exchange: 'Intercâmbio de estudantes',
    act_language_courses: 'Cursos de idiomas',
    act_certifications: 'Certificações complementares',
    act_scholarships: 'Bolsas de estudo',
    act_study_trips: 'Viagens de estudo',
    act_dual_degree: 'Duplo grau',
    act_credit_transfer: 'Equivalência de créditos',
    act_other: 'Outros',

    rubric_title: 'Rubrica de Avaliação GAN',
    rubric_accreditation: 'Acreditações (40%)',
    rubric_motivation: 'Motivação e atividades (30%)',
    rubric_institution: 'Dados institucionais (20%)',
    rubric_contact: 'Contato e seriedade (10%)',
    rubric_min_score: 'Pontuação mínima de aprovação: 70/100',

    btn_submit: 'Enviar candidatura',
    btn_submitting: 'IA avaliando...',

    result_approved_title: 'Candidatura Aprovada!',
    result_approved_msg: 'Parabéns. Sua instituição foi aprovada como membro GAN. Você receberá um e-mail com as instruções de acesso.',
    result_rejected_title: 'Candidatura Não Aprovada',
    result_rejected_msg: 'Infelizmente sua candidatura não atingiu a pontuação mínima exigida. Abaixo a avaliação detalhada:',
    result_review_title: 'Em Revisão',
    result_review_msg: 'Sua candidatura será revisada manualmente pela equipe GAN. Entraremos em contato em breve.',
    result_score: 'Pontuação obtida',

    login_title: 'Acessar GAN Platform',
    login_email: 'E-mail',
    login_password: 'Senha',
    login_btn: 'Entrar',
    login_forgot: 'Esqueceu sua senha?',
    login_error: 'Credenciais incorretas. Tente novamente.',

    admin_title: 'Minha Instituição',
    admin_users_title: 'Gestão de Usuários',
    admin_users_subtitle: 'Você pode criar até 5 usuários para sua instituição.',
    admin_add_user: 'Adicionar usuário',
    admin_edit_user: 'Editar usuário',
    admin_delete_user: 'Excluir usuário',
    admin_users_limit: 'Você atingiu o limite de 5 usuários.',
    admin_name: 'Nome',
    admin_email: 'E-mail',
    admin_role_title: 'Cargo',
    admin_save: 'Salvar',
    admin_cancel: 'Cancelar',
    admin_confirm_delete: 'Excluir este usuário?',

    portal_title: 'Benefícios GAN',
    portal_subtitle: 'Descontos e benefícios exclusivos para membros GAN.',
    portal_filter_all: 'Todos',
    portal_filter_software: 'Software',
    portal_filter_courses: 'Cursos',
    portal_filter_titles: 'Títulos',
    portal_filter_travel: 'Viagens',
    portal_filter_books: 'Livros',
    portal_filter_events: 'Eventos',
    portal_filter_other: 'Outros',
    portal_discount: 'desconto',
    portal_claim: 'Obter benefício',
    portal_claimed: 'Já resgatado',
    portal_code_label: 'Seu código:',
    portal_link_label: 'Acessar benefício',
    portal_expires: 'Válido até',
    portal_unlimited: 'Ilimitado',
    portal_available: 'disponíveis',

    dir_title: 'Diretório de Membros',
    dir_subtitle: 'Conheça os membros da rede GAN.',
    dir_filter_country: 'País',
    dir_filter_institution: 'Instituição',
    dir_all_countries: 'Todos os países',
    dir_all_institutions: 'Todas as instituições',
    dir_contact: 'Contatar',
    dir_linkedin: 'LinkedIn',
    dir_no_results: 'Nenhum membro encontrado com os filtros selecionados.',

    error_required: 'Este campo é obrigatório.',
    error_email: 'Insira um e-mail válido.',
    error_generic: 'Ocorreu um erro. Tente novamente.',
    error_session: 'Sua sessão expirou. Faça login novamente.',
  },

  fr: {
    nav_apply: 'Postuler',
    nav_login: 'Connexion',
    nav_portal: 'Avantages',
    nav_directory: 'Annuaire',
    nav_admin: 'Mon Institution',
    nav_logout: 'Déconnexion',

    hero_title: 'Réseau Mondial d\'Universités GAN',
    hero_subtitle: 'Nous connectons les établissements d\'enseignement supérieur pour partager des avantages, des connaissances et des opportunités pour les étudiants et les enseignants.',
    hero_cta: 'Postuler pour l\'adhésion',
    hero_login: 'Accéder aux avantages',

    apply_title: 'Demande d\'Adhésion',
    apply_subtitle: 'Remplissez le formulaire. L\'IA évaluera votre candidature selon la rubrique GAN.',
    section_institution: 'Données de l\'Institution',
    section_contact: 'Contact Principal',
    section_metrics: 'Indicateurs Institutionnels',
    section_motivation: 'Motivation et Objectifs',
    section_activities: 'Activités à Développer avec GAN',

    field_inst_name: 'Nom de l\'institution',
    field_country: 'Pays',
    field_inst_type: 'Type d\'institution',
    field_website: 'Site web',
    field_founded: 'Année de fondation',
    field_contact_name: 'Nom complet',
    field_contact_role: 'Poste',
    field_contact_email: 'Adresse e-mail',
    field_contact_phone: 'Téléphone',
    field_students: 'Nombre d\'étudiants',
    field_programs: 'Programmes académiques',
    field_accreditations: 'Accréditations nationales et internationales',
    field_motivation: 'Pourquoi voulez-vous rejoindre GAN et qu\'apporteriez-vous ?',

    type_university: 'Université',
    type_institute: 'Institut',
    type_college: 'Collège universitaire',
    type_other: 'Autre',

    act_teacher_exchange: 'Échange d\'enseignants',
    act_student_exchange: 'Échange d\'étudiants',
    act_language_courses: 'Cours de langues',
    act_certifications: 'Certifications complémentaires',
    act_scholarships: 'Bourses',
    act_study_trips: 'Voyages d\'études',
    act_dual_degree: 'Double diplôme',
    act_credit_transfer: 'Reconnaissance de crédits',
    act_other: 'Autres',

    rubric_title: 'Rubrique d\'Évaluation GAN',
    rubric_accreditation: 'Accréditations (40%)',
    rubric_motivation: 'Motivation et activités (30%)',
    rubric_institution: 'Données institutionnelles (20%)',
    rubric_contact: 'Contact et sérieux (10%)',
    rubric_min_score: 'Score minimum d\'approbation : 70/100',

    btn_submit: 'Soumettre la candidature',
    btn_submitting: 'IA en cours d\'évaluation...',

    result_approved_title: 'Candidature Approuvée !',
    result_approved_msg: 'Félicitations. Votre institution a été approuvée en tant que membre GAN. Vous recevrez un e-mail avec les instructions d\'accès.',
    result_rejected_title: 'Candidature Non Approuvée',
    result_rejected_msg: 'Malheureusement, votre candidature n\'a pas atteint le score minimum requis. Voici l\'évaluation détaillée :',
    result_review_title: 'En Cours d\'Examen',
    result_review_msg: 'Votre candidature sera examinée manuellement par l\'équipe GAN. Nous vous contacterons prochainement.',
    result_score: 'Score obtenu',

    login_title: 'Accéder à GAN Platform',
    login_email: 'Adresse e-mail',
    login_password: 'Mot de passe',
    login_btn: 'Se connecter',
    login_forgot: 'Mot de passe oublié ?',
    login_error: 'Identifiants incorrects. Veuillez réessayer.',

    admin_title: 'Mon Institution',
    admin_users_title: 'Gestion des Utilisateurs',
    admin_users_subtitle: 'Vous pouvez créer jusqu\'à 5 utilisateurs pour votre institution.',
    admin_add_user: 'Ajouter un utilisateur',
    admin_edit_user: 'Modifier l\'utilisateur',
    admin_delete_user: 'Supprimer l\'utilisateur',
    admin_users_limit: 'Vous avez atteint la limite de 5 utilisateurs.',
    admin_name: 'Nom',
    admin_email: 'E-mail',
    admin_role_title: 'Poste',
    admin_save: 'Enregistrer',
    admin_cancel: 'Annuler',
    admin_confirm_delete: 'Supprimer cet utilisateur ?',

    portal_title: 'Avantages GAN',
    portal_subtitle: 'Remises et avantages exclusifs pour les membres GAN.',
    portal_filter_all: 'Tous',
    portal_filter_software: 'Logiciels',
    portal_filter_courses: 'Cours',
    portal_filter_titles: 'Diplômes',
    portal_filter_travel: 'Voyages',
    portal_filter_books: 'Livres',
    portal_filter_events: 'Événements',
    portal_filter_other: 'Autres',
    portal_discount: 'de réduction',
    portal_claim: 'Obtenir l\'avantage',
    portal_claimed: 'Déjà obtenu',
    portal_code_label: 'Votre code :',
    portal_link_label: 'Accéder à l\'avantage',
    portal_expires: 'Valable jusqu\'au',
    portal_unlimited: 'Illimité',
    portal_available: 'disponibles',

    dir_title: 'Annuaire des Membres',
    dir_subtitle: 'Découvrez les membres du réseau GAN.',
    dir_filter_country: 'Pays',
    dir_filter_institution: 'Institution',
    dir_all_countries: 'Tous les pays',
    dir_all_institutions: 'Toutes les institutions',
    dir_contact: 'Contacter',
    dir_linkedin: 'LinkedIn',
    dir_no_results: 'Aucun membre trouvé avec les filtres sélectionnés.',

    error_required: 'Ce champ est obligatoire.',
    error_email: 'Entrez un e-mail valide.',
    error_generic: 'Une erreur s\'est produite. Veuillez réessayer.',
    error_session: 'Votre session a expiré. Veuillez vous reconnecter.',
  }
};

// ============================================================
// Motor i18n
// ============================================================
const I18n = (() => {
  let currentLang = localStorage.getItem('gan_lang') || navigator.language.slice(0, 2) || 'es';
  if (!TRANSLATIONS[currentLang]) currentLang = 'es';

  function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['es'][key] || key;
  }

  function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('gan_lang', lang);
    applyToDOM();
    document.documentElement.lang = lang;
  }

  function getLang() { return currentLang; }

  // Aplica traducciones a elementos con data-i18n="key"
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
  }

  function init() {
    document.documentElement.lang = currentLang;
    // Marcar botón activo en el selector de idioma
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === currentLang);
      btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-btn')));
    });
    applyToDOM();
  }

  return { t, setLang, getLang, init, applyToDOM };
})();

// Auto-init cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
  I18n.init();
}
