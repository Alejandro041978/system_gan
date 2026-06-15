-- ============================================================
-- GAN PLATFORM — Schema SQL
-- Ejecutar en Supabase SQL Editor en este orden
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: institutions
-- Representa cada universidad/instituto miembro de GAN
-- ============================================================
CREATE TABLE institutions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  country       TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('university', 'institute', 'college', 'other')),
  website       TEXT,
  founded_year  INT,
  student_count INT,
  programs      INT,
  accreditations TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: applications
-- Postulaciones enviadas por instituciones
-- ============================================================
CREATE TABLE applications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Datos institución
  institution_name    TEXT NOT NULL,
  country             TEXT NOT NULL,
  institution_type    TEXT NOT NULL,
  website             TEXT,
  founded_year        INT,
  -- Contacto principal
  contact_name        TEXT NOT NULL,
  contact_role        TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  -- Métricas
  student_count       INT,
  programs_count      INT,
  accreditations      TEXT,
  -- Motivación
  motivation          TEXT NOT NULL,
  -- Actividades propuestas (array de strings)
  proposed_activities TEXT[] NOT NULL DEFAULT '{}',
  -- Evaluación IA
  ai_score            NUMERIC(5,2),
  ai_decision         TEXT CHECK (ai_decision IN ('approved', 'rejected', 'review')),
  ai_justification    TEXT,
  ai_breakdown        JSONB,  -- { accreditation: 38, motivation: 27, institution: 18, contact: 9 }
  -- Estado final (puede ser override del admin)
  final_decision      TEXT CHECK (final_decision IN ('approved', 'rejected', 'pending')),
  final_notes         TEXT,
  -- Referencia a institución creada si fue aprobada
  institution_id      UUID REFERENCES institutions(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ
);

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos adicionales
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id  UUID REFERENCES institutions(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  role_title      TEXT,                    -- Cargo en la institución
  email           TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  linkedin_url    TEXT,
  app_role        TEXT NOT NULL DEFAULT 'member'
                  CHECK (app_role IN ('super_admin', 'institution_admin', 'member')),
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,  -- Visible en directorio
  preferred_lang  TEXT NOT NULL DEFAULT 'es'
                  CHECK (preferred_lang IN ('es', 'en', 'pt', 'fr')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: benefits
-- Beneficios disponibles para los miembros
-- ============================================================
CREATE TABLE benefits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Contenido multiidioma
  title_es      TEXT NOT NULL,
  title_en      TEXT NOT NULL,
  title_pt      TEXT NOT NULL,
  title_fr      TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  -- Proveedor
  provider_name TEXT NOT NULL,
  provider_logo TEXT,
  -- Tipo y acceso
  category      TEXT NOT NULL CHECK (category IN ('software', 'courses', 'travel', 'books', 'events', 'other')),
  discount_pct  INT,           -- % de descuento (si aplica)
  code          TEXT,          -- Código de descuento
  link          TEXT,          -- URL de canje
  -- Disponibilidad
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  valid_until   DATE, -- Usar fechas futuras al insertar beneficios
  -- Límite de canjes (null = ilimitado)
  max_claims    INT,
  current_claims INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: benefit_claims
-- Registro de quién canjeó qué beneficio
-- ============================================================
CREATE TABLE benefit_claims (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benefit_id  UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  claimed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(benefit_id, user_id)  -- Un usuario solo puede canjear cada beneficio una vez
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_applications_email    ON applications(contact_email);
CREATE INDEX idx_applications_decision ON applications(final_decision);
CREATE INDEX idx_profiles_institution  ON profiles(institution_id);
CREATE INDEX idx_profiles_role         ON profiles(app_role);
CREATE INDEX idx_benefits_active       ON benefits(is_active, valid_until);
CREATE INDEX idx_benefit_claims_user   ON benefit_claims(user_id);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: crear profile al registrarse usuario en auth
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'app_role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE institutions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_claims   ENABLE ROW LEVEL SECURITY;

-- Helper: obtener app_role del usuario actual
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT app_role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: obtener institution_id del usuario actual
CREATE OR REPLACE FUNCTION current_user_institution()
RETURNS UUID AS $$
  SELECT institution_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: contar usuarios de una institución
CREATE OR REPLACE FUNCTION count_institution_members(inst_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM profiles WHERE institution_id = inst_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- institutions ---
CREATE POLICY "Super admin ve todo" ON institutions
  FOR ALL USING (current_user_role() = 'super_admin');

CREATE POLICY "Miembro ve su institución" ON institutions
  FOR SELECT USING (id = current_user_institution());

-- --- applications ---
CREATE POLICY "Super admin gestiona postulaciones" ON applications
  FOR ALL USING (current_user_role() = 'super_admin');

CREATE POLICY "Anon puede insertar postulación" ON applications
  FOR INSERT WITH CHECK (TRUE);

-- --- profiles ---
CREATE POLICY "Super admin ve todos los perfiles" ON profiles
  FOR ALL USING (current_user_role() = 'super_admin');

CREATE POLICY "Institution admin ve/edita su institución" ON profiles
  FOR ALL USING (
    current_user_role() = 'institution_admin'
    AND institution_id = current_user_institution()
  );

CREATE POLICY "Miembro ve su propio perfil" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Miembro actualiza su propio perfil" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Directorio: miembros ven perfiles visibles" ON profiles
  FOR SELECT USING (
    is_visible = TRUE
    AND current_user_role() IN ('super_admin', 'institution_admin', 'member')
  );

-- --- benefits ---
CREATE POLICY "Todos los miembros ven beneficios activos" ON benefits
  FOR SELECT USING (
    is_active = TRUE
    AND current_user_role() IN ('super_admin', 'institution_admin', 'member')
  );

CREATE POLICY "Super admin gestiona beneficios" ON benefits
  FOR ALL USING (current_user_role() = 'super_admin');

-- --- benefit_claims ---
CREATE POLICY "Miembro ve y crea sus propios canjes" ON benefit_claims
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin ve todos los canjes" ON benefit_claims
  FOR SELECT USING (current_user_role() = 'super_admin');
