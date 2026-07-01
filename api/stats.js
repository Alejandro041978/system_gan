// GET /api/stats
// Estadísticas públicas del sistema (sin autenticación requerida).
// Usa service role para bypass de RLS.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const [
    { count: institutions },
    { count: benefits },
    { count: members },
    { data: instData },
  ] = await Promise.all([
    supabase.from('institutions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('benefits').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('institutions').select('country, student_count').eq('status', 'approved'),
  ]);

  const countries      = new Set(instData?.map(r => r.country) || []).size;
  const total_students = (instData || []).reduce((s, r) => s + (r.student_count || 0), 0);

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({
    institutions: institutions ?? 0,
    benefits:     benefits     ?? 0,
    members:      members      ?? 0,
    countries,
    total_students,
  });
}
