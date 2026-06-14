// Vercel Function — /api/benefits
// GET  → listar beneficios activos
// POST → canjear un beneficio (claim)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getCallerProfile(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return profile;
}

export default async function handler(req, res) {
  const caller = await getCallerProfile(req.headers.authorization);
  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  const lang = req.query.lang || caller.preferred_lang || 'es';

  // ── GET: listar beneficios ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { category } = req.query;

    let query = supabase
      .from('benefits')
      .select(`
        id,
        title_${lang},
        description_${lang},
        provider_name,
        provider_logo,
        category,
        discount_pct,
        link,
        valid_until,
        max_claims,
        current_claims
      `)
      .eq('is_active', true)
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString().slice(0, 10)}`)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: benefits, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Obtener los canjes del usuario actual
    const { data: userClaims } = await supabase
      .from('benefit_claims')
      .select('benefit_id')
      .eq('user_id', caller.id);

    const claimedIds = new Set(userClaims?.map(c => c.benefit_id) || []);

    const result = benefits.map(b => ({
      id:           b.id,
      title:        b[`title_${lang}`] || b.title_es,
      description:  b[`description_${lang}`] || b.description_es,
      provider_name: b.provider_name,
      provider_logo: b.provider_logo,
      category:     b.category,
      discount_pct: b.discount_pct,
      link:         b.link,
      valid_until:  b.valid_until,
      max_claims:   b.max_claims,
      available:    b.max_claims ? b.max_claims - b.current_claims : null,
      claimed:      claimedIds.has(b.id)
    }));

    return res.status(200).json({ benefits: result });
  }

  // ── POST: canjear beneficio ─────────────────────────────────────────
  if (req.method === 'POST') {
    const { benefit_id } = req.body;
    if (!benefit_id) return res.status(400).json({ error: 'benefit_id required' });

    // Verificar que el beneficio existe y tiene cupos
    const { data: benefit, error: bErr } = await supabase
      .from('benefits')
      .select('id, code, link, max_claims, current_claims, is_active, valid_until')
      .eq('id', benefit_id)
      .single();

    if (bErr || !benefit) return res.status(404).json({ error: 'Benefit not found' });
    if (!benefit.is_active) return res.status(400).json({ error: 'Benefit is not active' });

    if (benefit.valid_until && new Date(benefit.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Benefit has expired' });
    }

    if (benefit.max_claims !== null && benefit.current_claims >= benefit.max_claims) {
      return res.status(400).json({ error: 'No more claims available' });
    }

    // Insertar claim (UNIQUE constraint previene duplicados)
    const { error: claimError } = await supabase
      .from('benefit_claims')
      .insert({ benefit_id, user_id: caller.id });

    if (claimError) {
      if (claimError.code === '23505') {
        // Ya canjeado — devolver los datos igual
        return res.status(200).json({ already_claimed: true, code: benefit.code, link: benefit.link });
      }
      return res.status(500).json({ error: claimError.message });
    }

    // Incrementar contador
    await supabase
      .from('benefits')
      .update({ current_claims: benefit.current_claims + 1 })
      .eq('id', benefit_id);

    return res.status(200).json({ code: benefit.code, link: benefit.link });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
