-- ==============================================================================
-- SAVE V2: COMPANY LOOKUP & POOL INTERESTS MIGRATION
-- Migration: 20260901010000_company_lookup_and_pool_interests.sql
-- ==============================================================================

-- 1. Extend Organizations Table with Verification and Public Lookup Fields
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS company_lookup_source TEXT,
  ADD COLUMN IF NOT EXISTS company_lookup_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS company_lookup_status TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS vat_registered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ro_efactura_status TEXT;

-- 2. Create Pool Interests Table for Collective Demand Proposals
CREATE TABLE IF NOT EXISTS public.pool_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  estimated_spend NUMERIC(15, 2) NOT NULL DEFAULT 0,
  estimated_volume NUMERIC(15, 2),
  unit TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'matched', 'invited', 'joined', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on pool_interests
ALTER TABLE public.pool_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view their pool interests" ON public.pool_interests;
CREATE POLICY "Org members can view their pool interests" ON public.pool_interests
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids()) 
    OR organization_id IN (SELECT id FROM public.organizations WHERE is_demo = true)
  );

DROP POLICY IF EXISTS "Org members can insert pool interests" ON public.pool_interests;
CREATE POLICY "Org members can insert pool interests" ON public.pool_interests
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_org_ids())
    OR organization_id IN (SELECT id FROM public.organizations WHERE is_demo = true)
  );

DROP POLICY IF EXISTS "Org members can update their pool interests" ON public.pool_interests;
CREATE POLICY "Org members can update their pool interests" ON public.pool_interests
  FOR UPDATE USING (
    organization_id IN (SELECT public.get_user_org_ids())
  );
