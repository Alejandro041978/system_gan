-- Migración: campos de notificación diferida (68h)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS contact_lang       TEXT NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS notify_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS applicant_notified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_notified     BOOLEAN NOT NULL DEFAULT FALSE;

-- Índice para que el cron encuentre rápido las pendientes
CREATE INDEX IF NOT EXISTS idx_applications_notify
  ON applications(applicant_notified, notify_at)
  WHERE applicant_notified = FALSE;
