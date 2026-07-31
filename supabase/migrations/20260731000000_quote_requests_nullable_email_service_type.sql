-- Migration: make quote_requests.email and quote_requests.service_type nullable
--
-- The streamlined quote form (components/QuoteForm.tsx) collects only
-- name, phone and postcode. The client inserts { name, phone, postcode }
-- directly into quote_requests (see QuoteForm.tsx handleSubmit), and the
-- QuoteRequest type in lib/supabase.ts already marks email/service_type
-- optional. The original table definition (20250930164244_create_roofing_tables.sql)
-- had both columns NOT NULL, so every form submission's Supabase insert
-- failed with a NOT NULL violation — swallowed by a try/catch fallback.
--
-- This migration drops those NOT NULL constraints so inserts succeed.

ALTER TABLE quote_requests ALTER COLUMN email DROP NOT NULL;
ALTER TABLE quote_requests ALTER COLUMN service_type DROP NOT NULL;
