-- ==============================================================================
-- SAVE V2: COMPANY PROFILE & RO e-FACTURA SYNCHRONIZATION MIGRATION
-- Migration: 20260901020000_company_profile_and_efactura.sql
-- ==============================================================================

-- 1. Create efactura_connections table
CREATE TABLE IF NOT EXISTS public.efactura_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cui TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_connected' CHECK (status IN ('not_connected', 'connecting', 'connected', 'needs_reauthorization', 'error')),
  environment TEXT DEFAULT 'production',
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  invoices_count INTEGER DEFAULT 0,
  suppliers_count INTEGER DEFAULT 0,
  sync_errors_count INTEGER DEFAULT 0,
  last_error TEXT,
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create efactura_sync_runs table
CREATE TABLE IF NOT EXISTS public.efactura_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.efactura_connections(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  invoices_received INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_imported INTEGER DEFAULT 0,
  duplicates_skipped INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create company_profile_snapshots table
CREATE TABLE IF NOT EXISTS public.company_profile_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  legal_name TEXT NOT NULL,
  cui TEXT NOT NULL,
  cui_numeric BIGINT,
  vat_id TEXT,
  vat_registered BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  status_details TEXT,
  efactura_registered BOOLEAN DEFAULT FALSE,
  address TEXT,
  city TEXT,
  county TEXT,
  postal_code TEXT,
  registration_number TEXT,
  caen_code TEXT,
  caen_description TEXT,
  revenue NUMERIC(15, 2),
  profit NUMERIC(15, 2),
  employees INTEGER,
  financial_year INTEGER,
  source TEXT NOT NULL DEFAULT 'ANAF',
  field_sources JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add field_sources and efactura columns to organizations if missing
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS field_sources JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS efactura_connection JSONB;

-- 5. Enable Row Level Security
ALTER TABLE public.efactura_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.efactura_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile_snapshots ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Tenant Isolation
DROP POLICY IF EXISTS "Org members can view their efactura connections" ON public.efactura_connections;
CREATE POLICY "Org members can view their efactura connections" ON public.efactura_connections
  FOR ALL USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR organization_id IN (SELECT id FROM public.organizations WHERE is_demo = true)
  );

DROP POLICY IF EXISTS "Org members can view their efactura sync runs" ON public.efactura_sync_runs;
CREATE POLICY "Org members can view their efactura sync runs" ON public.efactura_sync_runs
  FOR ALL USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR organization_id IN (SELECT id FROM public.organizations WHERE is_demo = true)
  );

DROP POLICY IF EXISTS "Org members can view their profile snapshots" ON public.company_profile_snapshots;
CREATE POLICY "Org members can view their profile snapshots" ON public.company_profile_snapshots
  FOR ALL USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR organization_id IN (SELECT id FROM public.organizations WHERE is_demo = true)
  );
