// GET /api/get-members
// Devuelve todos los perfiles con last_sign_in_at de auth.users.
// Solo accesible para super_admin.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  const { data: { user: caller } } = await supabase.auth.getUser(token);
  if (!caller) return res.status(401).json({ error: 'Token inválido' });

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('app_role')
    .eq('id', caller.id)
    .single();

  if (callerProfile?.app_role !== 'super_admin') {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  // Perfiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role_title, app_role, institution_id, preferred_lang, institutions(name)')
    .order('full_name');

  if (error) return res.status(500).json({ error: error.message });

  // Usuarios de auth (con last_sign_in_at) — paginado por Supabase (max 1000)
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  const lastLoginMap = {};
  for (const u of authUsers || []) {
    lastLoginMap[u.id] = u.last_sign_in_at || null;
  }

  const members = profiles.map(p => ({
    ...p,
    last_login: lastLoginMap[p.id] || null,
  }));

  return res.status(200).json({ members });
}
