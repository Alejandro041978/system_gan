// GAN Platform — Cliente Supabase compartido
// Las variables SUPABASE_URL y SUPABASE_ANON_KEY se inyectan desde config.js (generado en build)
// o desde window.__GAN_CONFIG__ definido en cada página HTML

const { createClient } = supabase;

const SUPABASE_URL  = window.__GAN_CONFIG__?.supabaseUrl  || '';
const SUPABASE_ANON = window.__GAN_CONFIG__?.supabaseAnon || '';

const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ============================================================
// Auth helpers
// ============================================================
const Auth = {
  async getSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  async getProfile() {
    const user = await Auth.getUser();
    if (!user) return null;
    const { data } = await db.from('profiles').select('*, institutions(name, country)').eq('id', user.id).single();
    return data;
  },

  async requireAuth(allowedRoles = []) {
    const session = await Auth.getSession();
    if (!session) {
      window.location.href = '/pages/login.html';
      return null;
    }
    if (allowedRoles.length === 0) return session;
    const profile = await Auth.getProfile();
    if (!allowedRoles.includes(profile?.app_role)) {
      window.location.href = '/pages/login.html';
      return null;
    }
    return { session, profile };
  },

  async signIn(email, password) {
    return db.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    await db.auth.signOut();
    window.location.href = '/pages/login.html';
  },

  async resetPassword(email) {
    return db.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/set-password.html`
    });
  }
};
