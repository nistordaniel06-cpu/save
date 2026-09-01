-- ==============================================================================
-- SAVE V2: VERIFIED DEMAND NETWORK FOR SMEs
-- Migration: 20260901_verified_demand_network.sql
-- ==============================================================================

-- 1. MARKETPLACE SUPPLIERS (Global vendor identities participating in bidding)
CREATE TABLE IF NOT EXISTS public.marketplace_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  cui TEXT,
  website TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  contact_email TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MARKETPLACE SUPPLIER USERS (Auth users linked to marketplace suppliers)
CREATE TABLE IF NOT EXISTS public.marketplace_supplier_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_supplier_id UUID NOT NULL REFERENCES public.marketplace_suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (marketplace_supplier_id, user_id)
);

-- 3. VERIFIED DEMANDS (Commercial demand derived from real spend / contract / extraction)
CREATE TABLE IF NOT EXISTS public.verified_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  source_contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  source_opportunity_id UUID REFERENCES public.savings_opportunities(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- Telecom, Curierat, Software
  subcategory TEXT,
  service_type TEXT NOT NULL, -- e.g. Flotă Mobilă Voce+Date, Expedieri Colete Național, Licențe SaaS
  incumbent_supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  incumbent_supplier_name TEXT NOT NULL,
  current_monthly_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_annual_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  volume NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL, -- SIM, line, parcel, shipment, seat, license
  current_unit_price NUMERIC(12,2),
  contract_end_date DATE,
  notice_deadline DATE,
  eligible_from DATE DEFAULT CURRENT_DATE,
  confidence_score INTEGER NOT NULL DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (
    status IN ('detected', 'needs_review', 'verified', 'pool_eligible', 'pooled', 'offer_available', 'accepted', 'rejected', 'completed')
  ),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DEMAND POOLS (Aggregated anonymous purchasing pools across SMEs)
CREATE TABLE IF NOT EXISTS public.demand_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT,
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Național',
  currency TEXT NOT NULL DEFAULT 'RON',
  status TEXT NOT NULL DEFAULT 'building' CHECK (
    status IN ('building', 'ready', 'open_for_bids', 'evaluating', 'offers_ready', 'closed')
  ),
  total_companies INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_current_annual_spend NUMERIC(14,2) NOT NULL DEFAULT 0,
  bidding_starts_at TIMESTAMPTZ,
  bidding_ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DEMAND POOL MEMBERS (Pool participation with explicit anonymous consent)
CREATE TABLE IF NOT EXISTS public.demand_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_pool_id UUID NOT NULL REFERENCES public.demand_pools(id) ON DELETE CASCADE,
  verified_demand_id UUID NOT NULL REFERENCES public.verified_demands(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    consent_status IN ('pending', 'accepted', 'rejected', 'withdrawn')
  ),
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE (demand_pool_id, verified_demand_id)
);

-- 6. SUPPLIER BIDS (Bids submitted by marketplace suppliers for pools)
CREATE TABLE IF NOT EXISTS public.supplier_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_pool_id UUID NOT NULL REFERENCES public.demand_pools(id) ON DELETE CASCADE,
  marketplace_supplier_id UUID NOT NULL REFERENCES public.marketplace_suppliers(id) ON DELETE CASCADE,
  pricing_model TEXT NOT NULL DEFAULT 'unit_fixed',
  price_per_unit NUMERIC(12,2) NOT NULL,
  estimated_monthly_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  estimated_annual_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  contract_duration_months INTEGER NOT NULL DEFAULT 24,
  minimum_volume NUMERIC(12,2) NOT NULL DEFAULT 1,
  sla_summary TEXT,
  benefits TEXT[] DEFAULT '{}',
  conditions TEXT,
  attachment_url TEXT,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('draft', 'submitted', 'shortlisted', 'rejected', 'selected', 'expired')
  ),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CLIENT OFFERS (Individual tailored offers resulting from winning bids)
CREATE TABLE IF NOT EXISTS public.client_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  verified_demand_id UUID NOT NULL REFERENCES public.verified_demands(id) ON DELETE CASCADE,
  demand_pool_id UUID NOT NULL REFERENCES public.demand_pools(id) ON DELETE CASCADE,
  supplier_bid_id UUID NOT NULL REFERENCES public.supplier_bids(id) ON DELETE CASCADE,
  current_annual_cost NUMERIC(12,2) NOT NULL,
  proposed_annual_cost NUMERIC(12,2) NOT NULL,
  estimated_savings NUMERIC(12,2) NOT NULL,
  savings_percentage NUMERIC(5,2) NOT NULL,
  proposed_unit_price NUMERIC(12,2) NOT NULL,
  contract_duration_months INTEGER NOT NULL DEFAULT 24,
  summary TEXT NOT NULL,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (
    status IN ('offered', 'viewed', 'accepted', 'rejected', 'expired')
  ),
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ENRICH MARKET BENCHMARKS WITH MISSING METADATA
ALTER TABLE public.market_benchmarks 
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Național',
  ADD COLUMN IF NOT EXISTS company_size_min INTEGER,
  ADD COLUMN IF NOT EXISTS company_size_max INTEGER,
  ADD COLUMN IF NOT EXISTS volume_min NUMERIC,
  ADD COLUMN IF NOT EXISTS volume_max NUMERIC,
  ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 85,
  ADD COLUMN IF NOT EXISTS source_reference TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_verified_demands_org ON public.verified_demands(organization_id);
CREATE INDEX IF NOT EXISTS idx_verified_demands_status ON public.verified_demands(status);
CREATE INDEX IF NOT EXISTS idx_verified_demands_category ON public.verified_demands(category);

CREATE INDEX IF NOT EXISTS idx_demand_pools_status ON public.demand_pools(status);
CREATE INDEX IF NOT EXISTS idx_demand_pools_category ON public.demand_pools(category);

CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON public.demand_pool_members(demand_pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_org ON public.demand_pool_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_supplier_bids_pool ON public.supplier_bids(demand_pool_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bids_supplier ON public.supplier_bids(marketplace_supplier_id);
CREATE INDEX IF NOT EXISTS idx_client_offers_org ON public.client_offers(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_offers_status ON public.client_offers(status);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.marketplace_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_supplier_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_offers ENABLE ROW LEVEL SECURITY;

-- 10.1 Verified Demands: Client can only view their own organization demands
CREATE POLICY "Clients can view own verified demands" 
  ON public.verified_demands FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- 10.2 Pool Members: Client can view and update consent for own org
CREATE POLICY "Clients can view own pool memberships"
  ON public.demand_pool_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update own consent status"
  ON public.demand_pool_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- 10.3 Client Offers: Client can view and accept/reject own offers
CREATE POLICY "Clients can view own offers"
  ON public.client_offers FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update offer status"
  ON public.client_offers FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- 10.4 Marketplace Suppliers: Supplier members can view own supplier profile
CREATE POLICY "Suppliers can view own company"
  ON public.marketplace_suppliers FOR SELECT
  USING (
    id IN (
      SELECT marketplace_supplier_id FROM public.marketplace_supplier_users WHERE user_id = auth.uid()
    )
  );

-- 10.5 Supplier Bids: Suppliers can view and manage own bids
CREATE POLICY "Suppliers can view own bids"
  ON public.supplier_bids FOR SELECT
  USING (
    marketplace_supplier_id IN (
      SELECT marketplace_supplier_id FROM public.marketplace_supplier_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can insert bids"
  ON public.supplier_bids FOR INSERT
  WITH CHECK (
    marketplace_supplier_id IN (
      SELECT marketplace_supplier_id FROM public.marketplace_supplier_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update own draft bids"
  ON public.supplier_bids FOR UPDATE
  USING (
    marketplace_supplier_id IN (
      SELECT marketplace_supplier_id FROM public.marketplace_supplier_users WHERE user_id = auth.uid()
    )
  );

-- 11. PRIVACY-PRESERVING SAFE SUPPLIER VIEW (MIN_ANONYMOUS_POOL_MEMBERS >= 3)
CREATE OR REPLACE FUNCTION public.get_anonymous_demand_pools()
RETURNS TABLE (
  pool_id UUID,
  category TEXT,
  subcategory TEXT,
  service_type TEXT,
  title TEXT,
  region TEXT,
  currency TEXT,
  status TEXT,
  total_companies INTEGER,
  total_volume NUMERIC,
  approximate_annual_spend NUMERIC,
  bidding_starts_at TIMESTAMPTZ,
  bidding_ends_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id AS pool_id,
    category,
    subcategory,
    service_type,
    title,
    region,
    currency,
    status,
    total_companies,
    total_volume,
    -- Round spend to protect individual company privacy
    ROUND(total_current_annual_spend / 1000) * 1000 AS approximate_annual_spend,
    bidding_starts_at,
    bidding_ends_at
  FROM public.demand_pools
  -- Privacy threshold enforced: At least 3 companies required to display to suppliers
  WHERE total_companies >= 3
    AND status IN ('open_for_bids', 'evaluating', 'offers_ready');
$$;
