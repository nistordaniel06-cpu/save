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

export const EMPTY_ORG_PLACEHOLDER: Organization = {
  id: '',
  name: '',
  cui: '',
  registrationNumber: '',
  industry: 'Servicii & B2B',
  employeeRange: '1-9',
  monthlyOpexRon: 0,
  saveScore: 0,
  isDemo: false,
  currency: 'RON',
  createdAt: '',
};

export const EMPTY_USER_PLACEHOLDER: Profile = {
  id: '',
  email: '',
  fullName: '',
  role: 'Director Financiar (Owner)',
  createdAt: '',
};

const DEMO_STORAGE_KEY = 'save_platform_demo_state_v2';
const REAL_STORAGE_KEY = 'save_platform_real_state_v2';

export function getDefaultDemoState(): AppState {
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

export function getEmptyRealState(user?: { id: string; email: string; fullName?: string }): AppState {
  return {
    currentOrg: EMPTY_ORG_PLACEHOLDER,
    currentUser: user
      ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName || user.email.split('@')[0],
          role: 'Director Financiar (Owner)',
          createdAt: new Date().toISOString(),
        }
      : EMPTY_USER_PLACEHOLDER,
    organizations: [],
    suppliers: [],
    contracts: [],
    documents: [],
    opportunities: [],
    spendRecords: [],
    optimizationRequests: [],
    verifiedSavings: [],
    benchmarks: [],
    auditLogs: [],
    verifiedDemands: [],
    demandPools: [],
    demandPoolMembers: [],
    marketplaceSuppliers: [],
    supplierBids: [],
    clientOffers: [],
  };
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

export function getSavedDemoState(): AppState | null {
  const storage = getStorage();
  if (storage) {
    const saved = storage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const defaults = getDefaultDemoState();
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
        console.error('Failed to parse saved SAVE demo state', e);
      }
    }
  }
  return null;
}

export function saveDemoState(state: AppState) {
  const storage = getStorage();
  if (storage) {
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  }
}

export function resetDemoState(): AppState {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(DEMO_STORAGE_KEY);
  }
  const fresh = getDefaultDemoState();
  saveDemoState(fresh);
  return fresh;
}

export function getSavedRealState(): AppState | null {
  const storage = getStorage();
  if (storage) {
    const saved = storage.getItem(REAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved SAVE real state', e);
      }
    }
  }
  return null;
}

export function saveRealState(state: AppState) {
  const storage = getStorage();
  if (storage) {
    storage.setItem(REAL_STORAGE_KEY, JSON.stringify(state));
  }
}

export function clearRealState() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(REAL_STORAGE_KEY);
  }
}

// Backward compatibility helpers
export const getDefaultState = getDefaultDemoState;
export const getInitialState = getEmptyRealState;
export const getSavedState = getSavedRealState;
export const saveState = saveRealState;
