// GET /api/public-benefits
// Devuelve beneficios activos para el widget público (sin autenticación).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { data, error } = await supabase
    .from('benefits')
    .select('id, title_es, title_en, title_pt, title_fr, description_es, description_en, description_pt, description_fr, provider_name, provider_logo, category, discount_pct')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  return res.status(200).json({ benefits: data || [] });
}
