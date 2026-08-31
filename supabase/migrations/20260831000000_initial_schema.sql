-- ============================================================================
-- SAVE B2B Procurement Intelligence Platform - Initial Database Schema
-- Multi-Tenant, Row-Level Security, Normalized Tables & Audit Tracing
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'Director Financiar (CFO)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cui TEXT,
    registration_number TEXT,
    industry TEXT NOT NULL DEFAULT 'Retail & E-commerce',
    employee_range TEXT NOT NULL DEFAULT '10-49',
    monthly_opex_ron NUMERIC(15, 2) DEFAULT 0,
    save_score INT NOT NULL DEFAULT 75 CHECK (save_score BETWEEN 0 AND 100),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    currency TEXT NOT NULL DEFAULT 'RON',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cui TEXT,
    category TEXT NOT NULL,
    contact_email TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'supplier_contract', 'subscription_agreement', 'quote')),
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'extracted', 'requires_review', 'verified', 'error')),
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Document Extractions
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL UNIQUE REFERENCES public.documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    category TEXT NOT NULL,
    invoice_number TEXT,
    invoice_date DATE,
    due_date DATE,
    invoice_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'RON',
    billing_period TEXT,
    contract_start DATE,
    contract_end DATE,
    notice_period_days INT,
    unit_price NUMERIC(15, 2),
    quantity NUMERIC(15, 2),
    automatic_renewal BOOLEAN DEFAULT FALSE,
    price_indexation TEXT,
    confidence INT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    review_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Spend Records
CREATE TABLE IF NOT EXISTS public.spend_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RON',
    spend_date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
    period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('one_off', 'monthly', 'quarterly', 'annual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    annual_value NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RON',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    notice_period_days INT NOT NULL DEFAULT 30,
    notice_deadline DATE NOT NULL,
    automatic_renewal BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_renewal_window', 'expired', 'renegotiated', 'terminated')),
    payment_terms TEXT DEFAULT '30 zile net',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Savings Opportunities
CREATE TABLE IF NOT EXISTS public.savings_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    current_annual_cost NUMERIC(15, 2) NOT NULL,
    estimated_savings_min NUMERIC(15, 2) NOT NULL,
    estimated_savings_max NUMERIC(15, 2) NOT NULL,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')),
    provenance TEXT NOT NULL CHECK (provenance IN ('demo', 'manually_verified', 'supplier_quote', 'dataset_source')),
    benchmark_reference TEXT,
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'requested', 'in_progress', 'applied', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Optimization Requests
CREATE TABLE IF NOT EXISTS public.optimization_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.savings_opportunities(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'requesting_offers', 'offer_received', 'accepted', 'completed', 'savings_verified', 'rejected')),
    initial_annual_cost NUMERIC(15, 2) NOT NULL,
    target_annual_cost NUMERIC(15, 2),
    achieved_annual_savings NUMERIC(15, 2) DEFAULT 0,
    operator_notes TEXT,
    client_notes TEXT,
    counter_offer_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Verified Savings
CREATE TABLE IF NOT EXISTS public.verified_savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    optimization_request_id UUID REFERENCES public.optimization_requests(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    verified_amount_annual NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RON',
    verification_method TEXT NOT NULL DEFAULT 'new_contract_signed',
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Market Benchmarks
CREATE TABLE IF NOT EXISTS public.market_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    service_tier TEXT NOT NULL,
    unit_metric TEXT NOT NULL,
    p25_price NUMERIC(15, 2) NOT NULL,
    p50_median_price NUMERIC(15, 2) NOT NULL,
    p75_price NUMERIC(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'RON',
    provenance TEXT NOT NULL CHECK (provenance IN ('demo', 'manually_verified', 'supplier_quote', 'dataset_source')),
    sample_size INT NOT NULL DEFAULT 50,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Events
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spend_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = target_org_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and Recreate Policies safely
DROP POLICY IF EXISTS "Users can access their organizations" ON public.organizations;
CREATE POLICY "Users can access their organizations" ON public.organizations
    FOR ALL USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations" ON public.organization_members
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Org members can access suppliers" ON public.suppliers;
CREATE POLICY "Org members can access suppliers" ON public.suppliers
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access documents" ON public.documents;
CREATE POLICY "Org members can access documents" ON public.documents
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access extractions" ON public.document_extractions;
CREATE POLICY "Org members can access extractions" ON public.document_extractions
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access spend records" ON public.spend_records;
CREATE POLICY "Org members can access spend records" ON public.spend_records
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access contracts" ON public.contracts;
CREATE POLICY "Org members can access contracts" ON public.contracts
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access opportunities" ON public.savings_opportunities;
CREATE POLICY "Org members can access opportunities" ON public.savings_opportunities
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access optimization requests" ON public.optimization_requests;
CREATE POLICY "Org members can access optimization requests" ON public.optimization_requests
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can access verified savings" ON public.verified_savings;
CREATE POLICY "Org members can access verified savings" ON public.verified_savings
    FOR ALL USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Org members can view audit events" ON public.audit_events;
CREATE POLICY "Org members can view audit events" ON public.audit_events
    FOR ALL USING (public.is_org_member(organization_id));
