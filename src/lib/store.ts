'use client';

import { 
  DEMO_ORG, 
  DEMO_USER, 
  DEMO_SUPPLIERS, 
  DEMO_CONTRACTS, 
  DEMO_DOCUMENTS, 
  DEMO_SAVINGS_OPPORTUNITIES, 
  DEMO_SPEND_RECORDS,
  DEMO_BENCHMARKS
} from './demo-data';
import { 
  Organization, 
  Profile, 
  Supplier, 
  ContractItem, 
  DocumentItem, 
  SavingsOpportunity, 
  SpendRecord, 
  OptimizationRequest,
  VerifiedSavingsItem,
  AuditEvent,
  MarketBenchmark,
  VerifiedDemand,
  DemandPool,
  DemandPoolMember,
  MarketplaceSupplier,
  SupplierBid,
  ClientOffer
} from './types';
import { 
  DEMO_VERIFIED_DEMANDS, 
  DEMO_DEMAND_POOLS, 
  DEMO_DEMAND_POOL_MEMBERS, 
  DEMO_MARKETPLACE_SUPPLIERS, 
  DEMO_SUPPLIER_BIDS, 
  DEMO_CLIENT_OFFERS 
} from './demand/demo-data';

export interface AppState {
  currentOrg: Organization;
  currentUser: Profile;
  organizations: Organization[];
  suppliers: Supplier[];
  contracts: ContractItem[];
  documents: DocumentItem[];
  opportunities: SavingsOpportunity[];
  spendRecords: SpendRecord[];
  optimizationRequests: OptimizationRequest[];
  verifiedSavings: VerifiedSavingsItem[];
  benchmarks: MarketBenchmark[];
  auditLogs: AuditEvent[];
  verifiedDemands: VerifiedDemand[];
  demandPools: DemandPool[];
  demandPoolMembers: DemandPoolMember[];
  marketplaceSuppliers: MarketplaceSupplier[];
  supplierBids: SupplierBid[];
  clientOffers: ClientOffer[];
}

const STORAGE_KEY = 'save_platform_state_v1';

export function getSavedState(): AppState | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const defaults = getDefaultState();
        return {
          ...defaults,
          ...parsed,
          verifiedDemands: parsed.verifiedDemands || defaults.verifiedDemands,
          demandPools: parsed.demandPools || defaults.demandPools,
          demandPoolMembers: parsed.demandPoolMembers || defaults.demandPoolMembers,
          marketplaceSuppliers: parsed.marketplaceSuppliers || defaults.marketplaceSuppliers,
          supplierBids: parsed.supplierBids || defaults.supplierBids,
          clientOffers: parsed.clientOffers || defaults.clientOffers,
        };
      } catch (e) {
        console.error('Failed to parse saved SAVE state', e);
      }
    }
  }
  return null;
}

export function getDefaultState(): AppState {
  return {
    currentOrg: DEMO_ORG,
    currentUser: DEMO_USER,
    organizations: [DEMO_ORG],
    suppliers: DEMO_SUPPLIERS,
    contracts: DEMO_CONTRACTS,
    documents: DEMO_DOCUMENTS,
    opportunities: DEMO_SAVINGS_OPPORTUNITIES,
    spendRecords: DEMO_SPEND_RECORDS,
    optimizationRequests: [
      {
        id: 'opt_req_01',
        organizationId: DEMO_ORG.id,
        organizationName: DEMO_ORG.name,
        opportunityId: 'opp_telecom_01',
        opportunityTitle: 'Contract telecom flotă mobilă posibil supraevaluat',
        supplierId: 'sup_vodafone',
        supplierName: 'Vodafone România SA',
        requestedBy: DEMO_USER.id,
        requestedByName: DEMO_USER.fullName,
        status: 'under_review',
        initialAnnualCost: 18400,
        targetAnnualCost: 14500,
        achievedAnnualSavings: 3900,
        operatorNotes: 'Analistul SAVE a contactat reprezentantul de cont Vodafone pentru revizuirea pool-ului de date.',
        clientNotes: 'Dorim reducerea costului pe SIM cu păstrarea numărului de 24 de linii.',
        counterOfferDetails: {
          proposedSupplier: 'Vodafone Corporate (Renegociat)',
          newAnnualCost: 14500,
          estimatedSavings: 3900,
          contractDurationMonths: 24,
          termsSummary: 'Tarif redus la 50 lei/SIM/lună + 100GB/SIM inclus.',
        },
        createdAt: '2026-08-25T10:00:00Z',
        updatedAt: '2026-08-28T14:30:00Z',
      },
    ],
    verifiedSavings: [],
    benchmarks: DEMO_BENCHMARKS,
    auditLogs: [
      {
        id: 'aud_01',
        organizationId: DEMO_ORG.id,
        actorId: DEMO_USER.id,
        actorName: DEMO_USER.fullName,
        action: 'auth.login',
        entityType: 'session',
        createdAt: '2026-08-31T08:00:00Z',
      },
      {
        id: 'aud_02',
        organizationId: DEMO_ORG.id,
        actorId: DEMO_USER.id,
        actorName: DEMO_USER.fullName,
        action: 'document.uploaded',
        entityType: 'document',
        entityId: 'doc_vdf_inv_08',
        metadata: { fileName: 'Factura_VDF_RO892301_Aug2026.pdf', confidence: 96 },
        createdAt: '2026-08-15T08:30:00Z',
      },
    ],
    verifiedDemands: DEMO_VERIFIED_DEMANDS,
    demandPools: DEMO_DEMAND_POOLS,
    demandPoolMembers: DEMO_DEMAND_POOL_MEMBERS,
    marketplaceSuppliers: DEMO_MARKETPLACE_SUPPLIERS,
    supplierBids: DEMO_SUPPLIER_BIDS,
    clientOffers: DEMO_CLIENT_OFFERS,
  };
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const getInitialState = getDefaultState;

export function resetDemoState(): AppState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  const fresh = getDefaultState();
  saveState(fresh);
  return fresh;
}
