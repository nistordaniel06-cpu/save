export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type DocumentType = 'invoice' | 'supplier_contract' | 'subscription_agreement' | 'quote';

export type DocumentStatus = 'uploaded' | 'processing' | 'extracted' | 'requires_review' | 'verified' | 'error';

export type SpendCategory = 
  | 'Telecom'
  | 'Software'
  | 'Curierat'
  | 'Consumabile'
  | 'Energie'
  | 'Servicii'
  | 'Altele';

export type ContractStatus = 'active' | 'in_renewal_window' | 'expired' | 'renegotiated' | 'terminated';

export type OpportunityConfidence = 'low' | 'medium' | 'high';

export type OpportunityProvenance = 'demo' | 'manually_verified' | 'supplier_quote' | 'dataset_source';

export type OpportunityStatus = 'open' | 'requested' | 'in_progress' | 'applied' | 'dismissed';

export type OptimizationStatus = 
  | 'new'
  | 'under_review'
  | 'requesting_offers'
  | 'offer_received'
  | 'accepted'
  | 'completed'
  | 'savings_verified'
  | 'rejected';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  cui?: string;
  registrationNumber?: string;
  industry: string;
  employeeRange: string;
  monthlyOpexRon: number;
  saveScore: number;
  isDemo: boolean;
  currency: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  user?: Profile;
  createdAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  cui?: string;
  category: SpendCategory;
  contactEmail?: string;
  rating: number;
  isPreferred: boolean;
  totalAnnualSpendRon: number;
  contractCount: number;
  invoiceCount: number;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  organizationId: string;
  supplierId?: string;
  supplierName?: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  documentType: DocumentType;
  status: DocumentStatus;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
  extraction?: DocumentExtraction;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  organizationId: string;
  supplier: string;
  documentType: DocumentType;
  category: SpendCategory;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  invoiceTotal: number;
  currency: string;
  billingPeriod?: string;
  contractStart?: string | null;
  contractEnd?: string | null;
  noticePeriodDays?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  automaticRenewal: boolean;
  priceIndexation?: string | null;
  confidence: number; // 0 to 100
  needsReview: boolean;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  fieldConfidences?: Record<string, number>;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
}

export interface SpendRecord {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  documentId?: string;
  category: SpendCategory;
  description: string;
  amount: number;
  currency: string;
  spendDate: string; // YYYY-MM-DD
  isRecurring: boolean;
  periodType: 'one_off' | 'monthly' | 'quarterly' | 'annual';
  createdAt: string;
}

export interface ContractItem {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  documentId?: string;
  title: string;
  category: SpendCategory;
  annualValue: number;
  currency: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  noticePeriodDays: number;
  noticeDeadline: string; // YYYY-MM-DD
  automaticRenewal: boolean;
  status: ContractStatus;
  paymentTerms: string;
  daysUntilExpiry?: number;
  daysUntilNotice?: number;
  notes?: string;
  createdAt: string;
}

export interface SavingsOpportunity {
  id: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  contractId?: string;
  title: string;
  category: SpendCategory;
  currentAnnualCost: number;
  estimatedSavingsMin: number;
  estimatedSavingsMax: number;
  confidenceLevel: OpportunityConfidence;
  provenance: OpportunityProvenance;
  benchmarkReference?: string;
  reason: string;
  recommendedAction: string;
  status: OpportunityStatus;
  createdAt: string;
}

export interface OptimizationRequest {
  id: string;
  organizationId: string;
  organizationName?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  supplierId?: string;
  supplierName?: string;
  requestedBy: string;
  requestedByName: string;
  status: OptimizationStatus;
  initialAnnualCost: number;
  targetAnnualCost?: number;
  achievedAnnualSavings: number;
  operatorNotes?: string;
  clientNotes?: string;
  counterOfferDetails?: {
    proposedSupplier?: string;
    newAnnualCost?: number;
    estimatedSavings?: number;
    contractDurationMonths?: number;
    termsSummary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VerifiedSavingsItem {
  id: string;
  organizationId: string;
  optimizationRequestId?: string;
  supplierId?: string;
  supplierName: string;
  category: SpendCategory;
  verifiedAmountAnnual: number;
  currency: string;
  verificationMethod: string;
  verifiedBy?: string;
  verifiedAt: string;
}

export interface MarketBenchmark {
  id: string;
  category: SpendCategory;
  serviceTier: string;
  unitMetric: string;
  p25Price: number;
  p50MedianPrice: number;
  p75Price: number;
  currency: string;
  provenance: OpportunityProvenance;
  sampleSize: number;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  organizationId?: string;
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface SaveScoreBreakdown {
  totalScore: number; // 0-100
  factors: {
    contractCoverage: { score: number; max: 25; label: string; details: string };
    benchmarkCompetitiveness: { score: number; max: 35; label: string; details: string };
    renewalNoticeReadiness: { score: number; max: 20; label: string; details: string };
    supplierConsolidation: { score: number; max: 20; label: string; details: string };
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  headline: string;
}
