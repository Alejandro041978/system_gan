// Vercel Function — /api/users
// GET  → listar usuarios de la institución
// POST → crear usuario (max 5)
// PUT  → actualizar usuario
// DELETE → eliminar usuario

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_USERS_PER_INSTITUTION = 5;

async function getCallerProfile(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, institutions(id, name)')
    .eq('id', user.id)
    .single();
  return profile;
}

export default async function handler(req, res) {
  const caller = await getCallerProfile(req.headers.authorization);
  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  const isAdmin = caller.app_role === 'institution_admin' || caller.app_role === 'super_admin';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const institutionId = caller.app_role === 'super_admin'
    ? (req.query.institution_id || caller.institution_id)
    : caller.institution_id;

  if (!institutionId) return res.status(400).json({ error: 'No institution assigned' });

  // ── GET: listar usuarios de la institución ──────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role_title, avatar_url, app_role, is_visible, preferred_lang, created_at')
      .eq('institution_id', institutionId)
      .neq('app_role', 'institution_admin') // El admin no se edita a sí mismo desde aquí
      .order('created_at');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data, count: data.length, max: MAX_USERS_PER_INSTITUTION });
  }

  // ── POST: crear usuario ─────────────────────────────────────────────
  if (req.method === 'POST') {
    // Contar usuarios actuales (excluye al admin)
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', institutionId)
      .neq('app_role', 'institution_admin');

    if (count >= MAX_USERS_PER_INSTITUTION) {
      return res.status(400).json({ error: 'User limit reached', max: MAX_USERS_PER_INSTITUTION });
    }

    const { full_name, email, role_title, preferred_lang = 'es' } = req.body;
    if (!full_name || !email) return res.status(400).json({ error: 'full_name and email are required' });

    // Crear usuario en Supabase Auth (genera contraseña temporal, envía email de invitación)
    const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name,
        app_role:       'member',
        institution_id: institutionId,
      },
      redirectTo: `${process.env.APP_URL || 'https://gan-platform.vercel.app'}/pages/login.html`
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Actualizar el perfil creado por el trigger
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        institution_id: institutionId,
        role_title,
        preferred_lang,
        app_role: 'member'
      })
      .eq('id', authUser.user.id);

    if (profileError) return res.status(500).json({ error: profileError.message });

    return res.status(201).json({ message: 'User invited', user_id: authUser.user.id });
  }

  // ── PUT: actualizar usuario ─────────────────────────────────────────
  if (req.method === 'PUT') {
    const { user_id, full_name, role_title, is_visible, preferred_lang } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // Verificar que el usuario pertenece a la institución
    const { data: target } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', user_id)
      .single();

    if (!target || target.institution_id !== institutionId) {
      return res.status(403).json({ error: 'User not in your institution' });
    }

    const updates = {};
    if (full_name !== undefined)    updates.full_name    = full_name;
    if (role_title !== undefined)   updates.role_title   = role_title;
    if (is_visible !== undefined)   updates.is_visible   = is_visible;
    if (preferred_lang !== undefined) updates.preferred_lang = preferred_lang;

    const { error } = await supabase.from('profiles').update(updates).eq('id', user_id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: 'User updated' });
  }

  // ── DELETE: eliminar usuario ────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const { data: target } = await supabase
      .from('profiles')
      .select('institution_id, app_role')
      .eq('id', user_id)
      .single();

    if (!target || target.institution_id !== institutionId) {
      return res.status(403).json({ error: 'User not in your institution' });
    }
    if (target.app_role === 'institution_admin') {
      return res.status(403).json({ error: 'Cannot delete institution admin' });
    }

    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: 'User deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
