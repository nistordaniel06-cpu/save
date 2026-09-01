'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AppState, 
  getDefaultDemoState,
  getEmptyRealState,
  getSavedDemoState,
  getSavedRealState,
  saveDemoState,
  saveRealState,
  clearRealState,
  resetDemoState,
  EMPTY_ORG_PLACEHOLDER,
  EMPTY_USER_PLACEHOLDER
} from './store';
import { 
  Organization, 
  Profile, 
  DocumentItem, 
  ContractItem, 
  SavingsOpportunity, 
  SpendRecord, 
  OptimizationRequest, 
  OptimizationStatus, 
  VerifiedSavingsItem, 
  AuditEvent,
  DocumentExtraction,
  SpendCategory,
  VerifiedDemand,
  VerifiedDemandStatus,
  DemandPool,
  DemandPoolMember,
  MarketplaceSupplier,
  SupplierBid,
  ClientOffer,
  PoolInterest
} from './types';
import { detectVerifiedDemands } from './demand/demand-detector';
import { calculateContractTimeline } from './analytics/contract-calculator';
import { supabase } from './supabase/client';
import { DEMO_ORG, DEMO_USER } from './demo-data';

interface SaveContextType {
  state: AppState;
  currentOrg: Organization;
  currentUser: Profile;
  organizations: Organization[];
  documents: DocumentItem[];
  contracts: ContractItem[];
  opportunities: SavingsOpportunity[];
  spendRecords: SpendRecord[];
  optimizationRequests: OptimizationRequest[];
  verifiedSavings: VerifiedSavingsItem[];
  verifiedDemands: VerifiedDemand[];
  demandPools: DemandPool[];
  demandPoolMembers: DemandPoolMember[];
  marketplaceSuppliers: MarketplaceSupplier[];
  supplierBids: SupplierBid[];
  clientOffers: ClientOffer[];
  poolInterests: PoolInterest[];
  auditLogs: AuditEvent[];
  isHydrated: boolean;
  isDemoMode: boolean;
  supabaseUser: any | null;
  switchOrganization: (orgId: string) => void;
  createOrganization: (orgData: Partial<Organization>) => Promise<Organization>;
  updateOrganization: (orgId: string, data: Partial<Organization>) => Promise<void>;
  submitPoolInterest: (interestData: Omit<PoolInterest, 'id' | 'organizationId' | 'createdAt' | 'status'>) => Promise<PoolInterest>;
  uploadDocument: (file: { name: string; type: string; size: number; textSnippet?: string; rawFile?: File | Blob }) => Promise<DocumentItem>;
  updateExtraction: (documentId: string, updatedExtraction: Partial<DocumentExtraction>) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  createOptimizationRequest: (data: {
    opportunityId?: string;
    supplierId?: string;
    supplierName: string;
    initialAnnualCost: number;
    clientNotes?: string;
  }) => Promise<OptimizationRequest>;
  updateOptimizationStatus: (
    requestId: string, 
    newStatus: OptimizationStatus, 
    options?: {
      operatorNotes?: string;
      achievedAnnualSavings?: number;
      counterOfferDetails?: OptimizationRequest['counterOfferDetails'];
    }
  ) => Promise<void>;
  verifyOptimizationSavings: (requestId: string, amountRon: number) => Promise<void>;
  joinDemandPool: (verifiedDemandId: string, demandPoolId: string) => Promise<void>;
  withdrawFromDemandPool: (verifiedDemandId: string, demandPoolId: string) => Promise<void>;
  acceptClientOffer: (offerId: string) => Promise<void>;
  rejectClientOffer: (offerId: string) => Promise<void>;
  submitSupplierBid: (bidData: Omit<SupplierBid, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<SupplierBid>;
  detectDemandsForCurrentOrg: () => Promise<VerifiedDemand[]>;
  updateVerifiedDemandStatus: (demandId: string, newStatus: VerifiedDemandStatus) => Promise<void>;
  createDemandPool: (poolData: Omit<DemandPool, 'id' | 'createdAt' | 'updatedAt' | 'totalCompanies' | 'totalVolume' | 'totalCurrentAnnualSpend'>) => Promise<DemandPool>;
  selectWinningBidAndGenerateOffers: (bidId: string) => Promise<void>;
  addContract: (contract: Omit<ContractItem, 'id' | 'organizationId' | 'createdAt'>) => Promise<ContractItem>;
  resetToDemo: () => void;
  signOut: () => Promise<void>;
  refreshRealData: () => Promise<void>;
}

const SaveContext = createContext<SaveContextType | null>(null);

export function SaveProvider({ 
  children, 
  isDemoMode = false 
}: { 
  children: React.ReactNode; 
  isDemoMode?: boolean;
}) {
  const [state, setState] = useState<AppState>(() => {
    if (isDemoMode) {
      return getSavedDemoState() || getDefaultDemoState();
    }
    return getSavedRealState() || getEmptyRealState();
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);

  const fetchOrgDataFromSupabase = async (orgId: string) => {
    try {
      // 1. Documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*, document_extractions(*)')
        .eq('organization_id', orgId);

      // 2. Contracts
      const { data: ctrs } = await supabase
        .from('contracts')
        .select('*')
        .eq('organization_id', orgId);

      // 3. Spend records
      const { data: spends } = await supabase
        .from('spend_records')
        .select('*')
        .eq('organization_id', orgId);

      // 4. Opportunities
      const { data: opps } = await supabase
        .from('savings_opportunities')
        .select('*')
        .eq('organization_id', orgId);

      // 5. Optimization requests
      const { data: reqs } = await supabase
        .from('optimization_requests')
        .select('*')
        .eq('organization_id', orgId);

      setState((prev) => {
        const mappedDocs: DocumentItem[] = (docs || []).map((d: any) => ({
          id: d.id,
          organizationId: d.organization_id,
          fileName: d.file_name,
          filePath: d.file_path,
          fileSizeBytes: Number(d.file_size_bytes),
          mimeType: d.mime_type,
          documentType: d.document_type,
          status: d.status,
          createdAt: d.created_at,
          extraction: d.document_extractions ? {
            id: d.document_extractions.id,
            documentId: d.id,
            organizationId: d.organization_id,
            supplier: d.document_extractions.supplier_name,
            documentType: d.document_extractions.document_type,
            category: d.document_extractions.category,
            invoiceNumber: d.document_extractions.invoice_number,
            invoiceDate: d.document_extractions.invoice_date,
            dueDate: d.document_extractions.due_date,
            invoiceTotal: Number(d.document_extractions.invoice_total),
            currency: d.document_extractions.currency,
            confidence: d.document_extractions.confidence,
            needsReview: d.document_extractions.needs_review,
            automaticRenewal: d.document_extractions.automatic_renewal,
            createdAt: d.document_extractions.created_at,
          } : undefined,
        }));

        const mappedContracts: ContractItem[] = (ctrs || []).map((c: any) => {
          const timeline = calculateContractTimeline(c);
          return {
            id: c.id,
            organizationId: c.organization_id,
            supplierId: c.supplier_id || 'sup_generic',
            supplierName: c.title,
            title: c.title,
            category: c.category,
            annualValue: Number(c.annual_value),
            currency: c.currency,
            startDate: c.start_date,
            expiryDate: c.expiry_date,
            noticePeriodDays: c.notice_period_days,
            noticeDeadline: c.notice_deadline,
            automaticRenewal: c.automatic_renewal,
            status: c.status,
            paymentTerms: c.payment_terms || '30 zile net',
            daysUntilExpiry: timeline.daysUntilExpiry,
            daysUntilNotice: timeline.daysUntilNotice,
            createdAt: c.created_at,
          };
        });

        const mappedSpend: SpendRecord[] = (spends || []).map((s: any) => ({
          id: s.id,
          organizationId: s.organization_id,
          supplierId: s.supplier_id || 'sup_generic',
          supplierName: s.category,
          category: s.category,
          description: s.description || '',
          amount: Number(s.amount),
          currency: s.currency,
          spendDate: s.spend_date,
          isRecurring: s.is_recurring,
          periodType: s.period_type,
          createdAt: s.created_at,
        }));

        const mappedOpps: SavingsOpportunity[] = (opps || []).map((o: any) => ({
          id: o.id,
          organizationId: o.organization_id,
          supplierId: o.supplier_id || 'sup_generic',
          supplierName: o.title,
          title: o.title,
          category: o.category,
          currentAnnualCost: Number(o.current_annual_cost),
          estimatedSavingsMin: Number(o.estimated_savings_min),
          estimatedSavingsMax: Number(o.estimated_savings_max),
          confidenceLevel: o.confidence_level,
          provenance: o.provenance,
          benchmarkReference: o.benchmark_reference,
          reason: o.reason,
          recommendedAction: o.recommended_action,
          status: o.status,
          createdAt: o.created_at,
        }));

        const mappedReqs: OptimizationRequest[] = (reqs || []).map((r: any) => ({
          id: r.id,
          organizationId: r.organization_id,
          requestedBy: r.requested_by,
          requestedByName: 'Utilizator',
          supplierName: 'Furnizor',
          status: r.status,
          initialAnnualCost: Number(r.initial_annual_cost),
          achievedAnnualSavings: Number(r.achieved_annual_savings || 0),
          clientNotes: r.client_notes,
          operatorNotes: r.operator_notes,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));

        const next = {
          ...prev,
          documents: mappedDocs.length > 0 ? mappedDocs : prev.documents.filter(d => d.organizationId !== orgId),
          contracts: mappedContracts.length > 0 ? mappedContracts : prev.contracts.filter(c => c.organizationId !== orgId),
          spendRecords: mappedSpend.length > 0 ? mappedSpend : prev.spendRecords.filter(s => s.organizationId !== orgId),
          opportunities: mappedOpps.length > 0 ? mappedOpps : prev.opportunities.filter(o => o.organizationId !== orgId),
          optimizationRequests: mappedReqs.length > 0 ? mappedReqs : prev.optimizationRequests.filter(r => r.organizationId !== orgId),
        };
        if (isDemoMode) {
          saveDemoState(next);
        } else {
          saveRealState(next);
        }
        return next;
      });
    } catch (e) {
      console.warn('Error fetching org data from Supabase:', e);
    }
  };

  const loadUserOrganizations = async (userId: string) => {
    if (isDemoMode) return;
    try {
      const { data: members, error: memErr } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(*)')
        .eq('user_id', userId);

      if (!memErr && members && members.length > 0) {
        const realOrgs: Organization[] = members
          .filter((m: any) => m.organizations && !m.organizations.is_demo)
          .map((m: any) => ({
            id: m.organizations.id,
            name: m.organizations.name,
            cui: m.organizations.cui,
            registrationNumber: m.organizations.registration_number,
            industry: m.organizations.industry || 'Servicii & B2B',
            employeeRange: m.organizations.employee_range || '10-49',
            monthlyOpexRon: Number(m.organizations.monthly_opex_ron) || 0,
            saveScore: m.organizations.save_score || 0,
            isDemo: false,
            currency: m.organizations.currency || 'RON',
            createdAt: m.organizations.created_at,
          }));

        if (realOrgs.length > 0) {
          setState((prev) => {
            const nextCurrent = realOrgs.find((o) => o.id === prev.currentOrg?.id) || realOrgs[0];
            const next = {
              ...prev,
              organizations: realOrgs,
              currentOrg: nextCurrent,
              currentUser: {
                id: userId,
                email: supabaseUser?.email || prev.currentUser.email,
                fullName: supabaseUser?.user_metadata?.full_name || prev.currentUser.fullName,
                role: 'Director Financiar (Owner)',
                createdAt: new Date().toISOString(),
              },
            };
            saveRealState(next);
            return next;
          });

          await fetchOrgDataFromSupabase(realOrgs[0].id);
        } else {
          setState((prev) => {
            const next = {
              ...prev,
              organizations: [],
              currentOrg: EMPTY_ORG_PLACEHOLDER,
            };
            saveRealState(next);
            return next;
          });
        }
      } else {
        setState((prev) => {
          const next = {
            ...prev,
            organizations: [],
            currentOrg: EMPTY_ORG_PLACEHOLDER,
          };
          saveRealState(next);
          return next;
        });
      }
    } catch (e) {
      console.warn('Could not load user organizations from Supabase, using local state:', e);
    }
  };

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    if (isDemoMode) {
      const savedDemo = getSavedDemoState();
      if (savedDemo) {
        setState(savedDemo);
      } else {
        setState(getDefaultDemoState());
      }
      setIsHydrated(true);
      return;
    }

    const savedReal = getSavedRealState();
    if (savedReal) {
      setState(savedReal);
    }
    setIsHydrated(true);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSupabaseUser(user);
        loadUserOrganizations(user.id);
      } else {
        setSupabaseUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await loadUserOrganizations(session.user.id);
      } else {
        setSupabaseUser(null);
        setState(getEmptyRealState());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      if (isDemoMode) {
        saveDemoState(next);
      } else {
        saveRealState(next);
      }
      return next;
    });
  };

  const switchOrganization = (orgId: string) => {
    const target = state.organizations.find((o) => o.id === orgId);
    if (target) {
      updateState((prev) => ({
        ...prev,
        currentOrg: target,
      }));
      if (!target.isDemo) {
        fetchOrgDataFromSupabase(target.id);
      }
    }
  };

  const createOrganization = async (orgData: Partial<Organization>): Promise<Organization> => {
    const orgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `org_${Date.now()}`;
    const newOrg: Organization = {
      id: orgId,
      name: orgData.name || 'Companie Nouă SRL',
      cui: orgData.cui || 'RO 00000000',
      industry: orgData.industry || 'Servicii & Tehnologie',
      employeeRange: orgData.employeeRange || '10-49',
      monthlyOpexRon: orgData.monthlyOpexRon || 25000,
      saveScore: 70,
      isDemo: false,
      currency: 'RON',
      createdAt: new Date().toISOString(),
    };

    // Try to persist to Supabase if authenticated
    try {
      const user = supabaseUser || (await supabase.auth.getUser()).data.user;
      if (user) {
        // Step 1: Insert organization WITHOUT .select().single() to avoid RLS race condition before membership is created
        const { error: orgErr } = await supabase
          .from('organizations')
          .insert({
            id: orgId,
            name: newOrg.name,
            cui: newOrg.cui,
            industry: newOrg.industry,
            employee_range: newOrg.employeeRange,
            monthly_opex_ron: newOrg.monthlyOpexRon,
            save_score: newOrg.saveScore,
            is_demo: false,
            currency: 'RON',
          });

        if (orgErr) {
          console.error('Supabase org insert error:', orgErr);
          throw orgErr;
        }

        // Step 2: Insert organization membership
        const { error: memErr } = await supabase
          .from('organization_members')
          .insert({
            organization_id: orgId,
            user_id: user.id,
            role: 'owner',
          });

        if (memErr) {
          console.error('Supabase member insert error:', memErr);
          throw memErr;
        }
      }
    } catch (e) {
      console.warn('Supabase organization insert notice:', e);
    }

    updateState((prev) => {
      const next = {
        ...prev,
        organizations: [...prev.organizations.filter(o => o.id !== newOrg.id), newOrg],
        currentOrg: newOrg,
      };
      if (isDemoMode) {
        saveDemoState(next);
      } else {
        saveRealState(next);
      }
      return next;
    });

    return newOrg;
  };

  const updateOrganization = async (orgId: string, data: Partial<Organization>): Promise<void> => {
    try {
      if (supabaseUser && !state.currentOrg.isDemo) {
        await supabase
          .from('organizations')
          .update({
            name: data.name,
            cui: data.cui,
            registration_number: data.registrationNumber,
            industry: data.industry,
            employee_range: data.employeeRange,
            monthly_opex_ron: data.monthlyOpexRon,
            save_score: data.saveScore,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orgId);
      }
    } catch (e) {
      console.warn('Could not update organization in Supabase:', e);
    }

    updateState((prev) => {
      const nextOrgs = prev.organizations.map((o) => (o.id === orgId ? { ...o, ...data } : o));
      const nextCurrent = prev.currentOrg.id === orgId ? { ...prev.currentOrg, ...data } : prev.currentOrg;
      const next = {
        ...prev,
        organizations: nextOrgs,
        currentOrg: nextCurrent,
      };
      if (isDemoMode) {
        saveDemoState(next);
      } else {
        saveRealState(next);
      }
      return next;
    });
  };

  const submitPoolInterest = async (interestData: Omit<PoolInterest, 'id' | 'organizationId' | 'createdAt' | 'status'>): Promise<PoolInterest> => {
    const interestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pool_int_${Date.now()}`;
    const newInterest: PoolInterest = {
      id: interestId,
      organizationId: state.currentOrg.id || 'org_unassigned',
      category: interestData.category,
      estimatedSpend: Number(interestData.estimatedSpend) || 0,
      estimatedVolume: interestData.estimatedVolume ? Number(interestData.estimatedVolume) : undefined,
      unit: interestData.unit,
      notes: interestData.notes,
      status: 'interested',
      createdAt: new Date().toISOString(),
    };

    try {
      if (supabaseUser && state.currentOrg.id && !state.currentOrg.isDemo) {
        await supabase.from('pool_interests').insert({
          id: interestId,
          organization_id: state.currentOrg.id,
          category: newInterest.category,
          estimated_spend: newInterest.estimatedSpend,
          estimated_volume: newInterest.estimatedVolume,
          unit: newInterest.unit,
          notes: newInterest.notes,
          status: newInterest.status,
        });
      }
    } catch (err) {
      console.warn('Could not persist pool interest to Supabase, saving locally:', err);
    }

    updateState((prev) => {
      const next = {
        ...prev,
        poolInterests: [newInterest, ...(prev.poolInterests || [])],
      };
      if (isDemoMode) {
        saveDemoState(next);
      } else {
        saveRealState(next);
      }
      return next;
    });

    return newInterest;
  };

  const uploadDocument = async (file: { 
    name: string; 
    type: string; 
    size: number; 
    textSnippet?: string; 
    rawFile?: File | Blob 
  }): Promise<DocumentItem> => {
    const docId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}`;
    const isRealOrg = !state.currentOrg.isDemo;
    const storagePath = `${state.currentOrg.id}/${docId}/${file.name}`;

    const newDoc: DocumentItem = {
      id: docId,
      organizationId: state.currentOrg.id,
      fileName: file.name,
      filePath: storagePath,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      documentType: file.name.toLowerCase().includes('contract') ? 'supplier_contract' : 'invoice',
      status: 'uploaded',
      uploadedByName: state.currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    // 1. Upload to Supabase Private Storage if in Real Organization
    if (isRealOrg && file.rawFile) {
      try {
        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(storagePath, file.rawFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          console.warn('Supabase private storage upload notice:', uploadErr.message);
        }

        // Insert database row in Supabase
        const user = supabaseUser || (await supabase.auth.getUser()).data.user;
        await supabase.from('documents').insert({
          id: docId,
          organization_id: state.currentOrg.id,
          file_name: file.name,
          file_path: storagePath,
          file_size_bytes: file.size,
          mime_type: file.type || 'application/pdf',
          document_type: newDoc.documentType,
          status: 'uploaded',
          uploaded_by: user?.id || null,
        });
      } catch (e) {
        console.warn('Supabase document persistence fallback:', e);
      }
    }

    // 2. Insert with uploaded / extracting status
    updateState((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }));

    // 3. Process AI Extraction pipeline via SERVER-SIDE API boundary
    let extraction: any;
    try {
      const formData = new FormData();
      if (file.rawFile) {
        formData.append('file', file.rawFile);
      } else {
        formData.append('file', new Blob([file.textSnippet || ''], { type: file.type || 'text/plain' }), file.name);
      }
      formData.append('isDemo', String(state.currentOrg.isDemo));

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.extraction) {
        extraction = data.extraction;
      } else {
        throw new Error(data.error || 'Eroare la procesarea server-side');
      }
    } catch (e: any) {
      console.warn('Server-side extraction error, falling back to manual review required:', e);
      extraction = {
        supplier: file.name.split('_')[0] || 'Furnizor de identificat',
        documentType: file.name.toLowerCase().includes('contract') ? 'supplier_contract' : 'invoice',
        category: 'Servicii' as SpendCategory,
        invoiceTotal: 0,
        currency: 'RON',
        confidence: 10,
        needsReview: true,
        reviewNotes: 'Documentul nu a putut fi analizat automat și necesită verificare.',
        automaticRenewal: false,
      };
    }

    const fullExtraction: DocumentExtraction = {
      id: `ext_${Date.now()}`,
      documentId: docId,
      organizationId: state.currentOrg.id,
      supplier: extraction.supplier,
      documentType: extraction.documentType,
      category: extraction.category as SpendCategory,
      invoiceNumber: extraction.invoiceNumber,
      invoiceDate: extraction.invoiceDate,
      dueDate: extraction.dueDate,
      invoiceTotal: extraction.invoiceTotal,
      currency: extraction.currency,
      billingPeriod: extraction.billingPeriod,
      contractStart: extraction.contractStart,
      contractEnd: extraction.contractEnd,
      noticePeriodDays: extraction.noticePeriodDays,
      unitPrice: extraction.unitPrice,
      quantity: extraction.quantity,
      automaticRenewal: extraction.automaticRenewal,
      priceIndexation: extraction.priceIndexation,
      confidence: extraction.confidence,
      needsReview: extraction.needsReview,
      reviewNotes: extraction.reviewNotes,
      fieldConfidences: extraction.fieldConfidences,
      rawPayload: extraction.rawPayload,
      createdAt: new Date().toISOString(),
    };

    const finalStatus = extraction.needsReview ? 'requires_review' : 'extracted';

    // Spend record setup
    let newSpendRecord: SpendRecord | undefined;
    if (extraction.documentType === 'invoice' || extraction.documentType === 'subscription_agreement') {
      const spendId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sp_${Date.now()}`;
      newSpendRecord = {
        id: spendId,
        organizationId: state.currentOrg.id,
        supplierId: `sup_${Date.now()}`,
        supplierName: extraction.supplier,
        documentId: docId,
        category: extraction.category as SpendCategory,
        description: `Factură ${file.name}`,
        amount: extraction.invoiceTotal || 0,
        currency: extraction.currency || 'RON',
        spendDate: extraction.invoiceDate || new Date().toISOString().split('T')[0],
        isRecurring: true,
        periodType: 'monthly',
        createdAt: new Date().toISOString(),
      };
    }

    // 4. Update in Supabase if real org with COMPLETE schema persistence
    if (isRealOrg) {
      try {
        await supabase.from('documents').update({
          status: finalStatus,
        }).eq('id', docId);

        await supabase.from('document_extractions').insert({
          document_id: docId,
          organization_id: state.currentOrg.id,
          supplier_name: extraction.supplier,
          document_type: extraction.documentType,
          category: extraction.category,
          invoice_number: extraction.invoiceNumber || null,
          invoice_date: extraction.invoiceDate || null,
          due_date: extraction.dueDate || null,
          invoice_total: extraction.invoiceTotal || 0,
          currency: extraction.currency || 'RON',
          billing_period: extraction.billingPeriod || null,
          contract_start: extraction.contractStart || null,
          contract_end: extraction.contractEnd || null,
          notice_period_days: extraction.noticePeriodDays || null,
          unit_price: extraction.unitPrice || null,
          quantity: extraction.quantity || null,
          automatic_renewal: extraction.automaticRenewal || false,
          price_indexation: extraction.priceIndexation || null,
          confidence: extraction.confidence || 0,
          needs_review: extraction.needsReview || false,
          review_notes: extraction.reviewNotes || null,
          raw_payload: extraction.rawPayload || null,
        });

        if (newSpendRecord && newSpendRecord.amount > 0) {
          await supabase.from('spend_records').insert({
            id: newSpendRecord.id,
            organization_id: state.currentOrg.id,
            supplier_id: newSpendRecord.supplierId,
            category: newSpendRecord.category,
            description: newSpendRecord.description,
            amount: newSpendRecord.amount,
            currency: newSpendRecord.currency,
            spend_date: newSpendRecord.spendDate,
            is_recurring: newSpendRecord.isRecurring,
            period_type: newSpendRecord.periodType,
          });
        }
      } catch (e) {
        console.warn('Supabase extraction update fallback:', e);
      }
    }

    // Update state and record audit log
    updateState((prev) => {
      const updatedDocs = prev.documents.map((d) =>
        d.id === docId ? { ...d, status: finalStatus as any, supplierName: extraction.supplier, extraction: fullExtraction } : d
      );

      const audit: AuditEvent = {
        id: `aud_${Date.now()}`,
        organizationId: prev.currentOrg.id,
        actorId: prev.currentUser.id,
        actorName: prev.currentUser.fullName,
        action: 'document.extracted',
        entityType: 'document',
        entityId: docId,
        metadata: { fileName: file.name, confidence: extraction.confidence, needsReview: extraction.needsReview },
        createdAt: new Date().toISOString(),
      };

      const updatedSpend = newSpendRecord ? [newSpendRecord, ...prev.spendRecords] : prev.spendRecords;

      return {
        ...prev,
        documents: updatedDocs,
        spendRecords: updatedSpend,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return {
      ...newDoc,
      status: finalStatus as any,
      supplierName: extraction.supplier,
      extraction: fullExtraction,
    };
  };

  const updateExtraction = async (documentId: string, updatedExtraction: Partial<DocumentExtraction>) => {
    const isRealOrg = !state.currentOrg.isDemo;
    const reviewedAt = new Date().toISOString();
    const reviewedBy = state.currentUser.fullName;

    if (isRealOrg) {
      try {
        await supabase.from('documents').update({
          status: 'verified',
        }).eq('id', documentId);

        await supabase.from('document_extractions').update({
          supplier_name: updatedExtraction.supplier,
          document_type: updatedExtraction.documentType,
          category: updatedExtraction.category,
          invoice_number: updatedExtraction.invoiceNumber,
          invoice_date: updatedExtraction.invoiceDate,
          due_date: updatedExtraction.dueDate,
          invoice_total: updatedExtraction.invoiceTotal,
          currency: updatedExtraction.currency,
          unit_price: updatedExtraction.unitPrice,
          quantity: updatedExtraction.quantity,
          contract_start: updatedExtraction.contractStart,
          contract_end: updatedExtraction.contractEnd,
          notice_period_days: updatedExtraction.noticePeriodDays,
          automatic_renewal: updatedExtraction.automaticRenewal,
          needs_review: false,
          reviewed_by: reviewedBy,
          reviewed_at: reviewedAt,
        }).eq('document_id', documentId);
      } catch (e) {
        console.warn('Supabase review update notice:', e);
      }
    }

    updateState((prev) => {
      const updatedDocs = prev.documents.map((d) => {
        if (d.id === documentId && d.extraction) {
          const merged: DocumentExtraction = {
            ...d.extraction,
            ...updatedExtraction,
            needsReview: false,
            reviewedBy,
            reviewedAt,
          };
          return {
            ...d,
            supplierName: merged.supplier,
            status: 'verified' as const,
            extraction: merged,
          };
        }
        return d;
      });

      return {
        ...prev,
        documents: updatedDocs,
      };
    });
  };

  const deleteDocument = async (documentId: string) => {
    const docToDelete = state.documents.find((d) => d.id === documentId);
    if (!state.currentOrg.isDemo && docToDelete) {
      try {
        await supabase.storage.from('documents').remove([docToDelete.filePath]);
        await supabase.from('documents').delete().eq('id', documentId);
      } catch (e) {
        console.warn('Supabase document delete notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== documentId),
    }));
  };

  const createOptimizationRequest = async (data: {
    opportunityId?: string;
    supplierId?: string;
    supplierName: string;
    initialAnnualCost: number;
    clientNotes?: string;
  }): Promise<OptimizationRequest> => {
    const opp = state.opportunities.find((o) => o.id === data.opportunityId);
    const newReqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `opt_req_${Date.now()}`;
    const newReq: OptimizationRequest = {
      id: newReqId,
      organizationId: state.currentOrg.id,
      organizationName: state.currentOrg.name,
      opportunityId: data.opportunityId,
      opportunityTitle: opp?.title,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      requestedBy: state.currentUser.id,
      requestedByName: state.currentUser.fullName,
      status: 'new',
      initialAnnualCost: data.initialAnnualCost,
      achievedAnnualSavings: 0,
      clientNotes: data.clientNotes,
      operatorNotes: 'Cerere recepționată. Un specialist SAVE va evalua contractul în maxim 24h.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('optimization_requests').insert({
          id: newReqId,
          organization_id: state.currentOrg.id,
          opportunity_id: data.opportunityId || null,
          supplier_id: data.supplierId || null,
          requested_by: supabaseUser?.id || null,
          initial_annual_cost: data.initialAnnualCost,
          status: 'new',
          client_notes: data.clientNotes,
        });
      } catch (e) {
        console.warn('Supabase request insert notice:', e);
      }
    }

    updateState((prev) => {
      const updatedOpps = prev.opportunities.map((o) =>
        o.id === data.opportunityId ? { ...o, status: 'requested' as const } : o
      );
      return {
        ...prev,
        opportunities: updatedOpps,
        optimizationRequests: [newReq, ...prev.optimizationRequests],
      };
    });

    return newReq;
  };

  const updateOptimizationStatus = async (
    requestId: string,
    newStatus: OptimizationStatus,
    options?: {
      operatorNotes?: string;
      achievedAnnualSavings?: number;
      counterOfferDetails?: OptimizationRequest['counterOfferDetails'];
    }
  ) => {
    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('optimization_requests').update({
          status: newStatus,
          achieved_annual_savings: options?.achievedAnnualSavings || 0,
          operator_notes: options?.operatorNotes,
        }).eq('id', requestId);
      } catch (e) {
        console.warn('Supabase status update notice:', e);
      }
    }

    updateState((prev) => {
      const updatedReqs = prev.optimizationRequests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: newStatus,
            operatorNotes: options?.operatorNotes !== undefined ? options.operatorNotes : req.operatorNotes,
            achievedAnnualSavings: options?.achievedAnnualSavings !== undefined ? options.achievedAnnualSavings : req.achievedAnnualSavings,
            counterOfferDetails: options?.counterOfferDetails !== undefined ? options.counterOfferDetails : req.counterOfferDetails,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      });

      return {
        ...prev,
        optimizationRequests: updatedReqs,
      };
    });
  };

  const verifyOptimizationSavings = async (requestId: string, amountRon: number) => {
    const req = state.optimizationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const verifiedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ver_${Date.now()}`;
    const verifiedItem: VerifiedSavingsItem = {
      id: verifiedId,
      organizationId: req.organizationId,
      optimizationRequestId: requestId,
      supplierId: req.supplierId,
      supplierName: req.supplierName || 'Furnizor Optimizat',
      category: 'Telecom',
      verifiedAmountAnnual: amountRon,
      currency: 'RON',
      verificationMethod: 'contract_renegotiated_signed',
      verifiedBy: state.currentUser.fullName,
      verifiedAt: new Date().toISOString(),
    };

    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('optimization_requests').update({
          status: 'savings_verified',
          achieved_annual_savings: amountRon,
          operator_notes: `Economii anuale de ${amountRon.toLocaleString('ro-RO')} lei verificate și validate de SAVE Admin.`,
        }).eq('id', requestId);

        await supabase.from('verified_savings').insert({
          id: verifiedId,
          organization_id: req.organizationId,
          optimization_request_id: requestId,
          supplier_id: req.supplierId || null,
          category: 'Telecom',
          verified_amount_annual: amountRon,
          currency: 'RON',
          verification_method: 'contract_renegotiated_signed',
          verified_by: state.currentUser.fullName,
          verified_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Supabase savings verification notice:', e);
      }
    }

    updateState((prev) => {
      const updatedReqs = prev.optimizationRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'savings_verified' as const,
              achievedAnnualSavings: amountRon,
              operatorNotes: `Economii anuale de ${amountRon.toLocaleString('ro-RO')} lei verificate și validate prin contract renegociat.`,
              updatedAt: new Date().toISOString(),
            }
          : r
      );

      return {
        ...prev,
        optimizationRequests: updatedReqs,
        verifiedSavings: [verifiedItem, ...prev.verifiedSavings],
      };
    });
  };

  const addContract = async (contractData: Omit<ContractItem, 'id' | 'organizationId' | 'createdAt'>): Promise<ContractItem> => {
    const timeline = calculateContractTimeline(contractData);
    const contractId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ctr_${Date.now()}`;
    const newContract: ContractItem = {
      ...contractData,
      id: contractId,
      organizationId: state.currentOrg.id,
      daysUntilExpiry: timeline.daysUntilExpiry,
      noticeDeadline: timeline.noticeDeadline,
      daysUntilNotice: timeline.daysUntilNotice,
      createdAt: new Date().toISOString(),
    };

    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('contracts').insert({
          id: contractId,
          organization_id: state.currentOrg.id,
          title: newContract.title,
          category: newContract.category,
          annual_value: newContract.annualValue,
          currency: newContract.currency,
          start_date: newContract.startDate,
          expiry_date: newContract.expiryDate,
          notice_period_days: newContract.noticePeriodDays,
          notice_deadline: newContract.noticeDeadline,
          automatic_renewal: newContract.automaticRenewal,
          status: newContract.status,
          payment_terms: newContract.paymentTerms,
        });
      } catch (e) {
        console.warn('Supabase contract insert notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      contracts: [newContract, ...prev.contracts],
    }));

    return newContract;
  };

  const resetToDemo = () => {
    if (isDemoMode) {
      const fresh = resetDemoState();
      setState(fresh);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    clearRealState();
    setState(getEmptyRealState());
    setSupabaseUser(null);
  };

  const refreshRealData = async () => {
    if (!state.currentOrg.isDemo && state.currentOrg.id) {
      await fetchOrgDataFromSupabase(state.currentOrg.id);
    }
  };

  const isCurrentDemo = Boolean(isDemoMode || state.currentOrg.isDemo);

  const joinDemandPool = async (verifiedDemandId: string, demandPoolId: string) => {
    const isRealOrg = !state.currentOrg.isDemo;
    const now = new Date().toISOString();

    if (isRealOrg) {
      try {
        await supabase.from('demand_pool_members').upsert({
          demand_pool_id: demandPoolId,
          verified_demand_id: verifiedDemandId,
          organization_id: state.currentOrg.id,
          consent_status: 'accepted',
          joined_at: now,
        }, { onConflict: 'demand_pool_id,verified_demand_id' });

        await supabase.from('verified_demands').update({
          status: 'pooled',
        }).eq('id', verifiedDemandId);
      } catch (e) {
        console.warn('Supabase join pool notice:', e);
      }
    }

    updateState((prev) => {
      const existingMember = prev.demandPoolMembers.find(
        (m) => m.demandPoolId === demandPoolId && m.verifiedDemandId === verifiedDemandId
      );

      let updatedMembers: DemandPoolMember[];
      if (existingMember) {
        updatedMembers = prev.demandPoolMembers.map((m) =>
          m.id === existingMember.id ? { ...m, consentStatus: 'accepted' as const, joinedAt: now } : m
        );
      } else {
        const newMember: DemandPoolMember = {
          id: `dpm_${Date.now()}`,
          demandPoolId,
          verifiedDemandId,
          organizationId: state.currentOrg.id,
          organizationName: state.currentOrg.name,
          consentStatus: 'accepted',
          joinedAt: now,
        };
        updatedMembers = [...prev.demandPoolMembers, newMember];
      }

      const updatedDemands = prev.verifiedDemands.map((d) =>
        d.id === verifiedDemandId ? { ...d, status: 'pooled' as const } : d
      );

      const targetDemand = updatedDemands.find((d) => d.id === verifiedDemandId);
      const additionalVol = targetDemand?.volume || 0;
      const additionalSpend = targetDemand?.currentAnnualCost || 0;

      const updatedPools = prev.demandPools.map((p) => {
        if (p.id === demandPoolId) {
          const poolMembers = updatedMembers.filter((m) => m.demandPoolId === demandPoolId && m.consentStatus === 'accepted');
          const isAlreadyCounted = existingMember?.consentStatus === 'accepted';
          return {
            ...p,
            totalCompanies: Math.max(p.totalCompanies, poolMembers.length),
            totalVolume: p.totalVolume + (isAlreadyCounted ? 0 : additionalVol),
            totalCurrentAnnualSpend: p.totalCurrentAnnualSpend + (isAlreadyCounted ? 0 : additionalSpend),
            status: (poolMembers.length >= 3 || p.totalCompanies >= 3) && p.status === 'building' ? 'ready' as const : p.status,
          };
        }
        return p;
      });

      return {
        ...prev,
        demandPoolMembers: updatedMembers,
        verifiedDemands: updatedDemands,
        demandPools: updatedPools,
      };
    });
  };

  const withdrawFromDemandPool = async (verifiedDemandId: string, demandPoolId: string) => {
    const isRealOrg = !state.currentOrg.isDemo;
    const now = new Date().toISOString();

    if (isRealOrg) {
      try {
        await supabase.from('demand_pool_members').update({
          consent_status: 'withdrawn',
          left_at: now,
        }).match({ demand_pool_id: demandPoolId, verified_demand_id: verifiedDemandId });

        await supabase.from('verified_demands').update({
          status: 'pool_eligible',
        }).eq('id', verifiedDemandId);
      } catch (e) {
        console.warn('Supabase withdraw pool notice:', e);
      }
    }

    updateState((prev) => {
      const updatedMembers = prev.demandPoolMembers.map((m) =>
        m.demandPoolId === demandPoolId && m.verifiedDemandId === verifiedDemandId
          ? { ...m, consentStatus: 'withdrawn' as const, leftAt: now }
          : m
      );

      const updatedDemands = prev.verifiedDemands.map((d) =>
        d.id === verifiedDemandId ? { ...d, status: 'pool_eligible' as const } : d
      );

      return {
        ...prev,
        demandPoolMembers: updatedMembers,
        verifiedDemands: updatedDemands,
      };
    });
  };

  const acceptClientOffer = async (offerId: string) => {
    const offer = state.clientOffers.find((o) => o.id === offerId);
    if (!offer) return;
    const now = new Date().toISOString();
    const isRealOrg = !state.currentOrg.isDemo;

    if (isRealOrg) {
      try {
        await supabase.from('client_offers').update({
          status: 'accepted',
          accepted_at: now,
        }).eq('id', offerId);

        await supabase.from('verified_demands').update({
          status: 'accepted',
        }).eq('id', offer.verifiedDemandId);
      } catch (e) {
        console.warn('Supabase accept offer notice:', e);
      }
    }

    const reqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `opt_req_${Date.now()}`;
    const newReq: OptimizationRequest = {
      id: reqId,
      organizationId: state.currentOrg.id,
      organizationName: state.currentOrg.name,
      supplierName: offer.supplierName || 'Furnizor Agregat Partener',
      requestedBy: state.currentUser.id,
      requestedByName: state.currentUser.fullName,
      status: 'accepted',
      initialAnnualCost: offer.currentAnnualCost,
      achievedAnnualSavings: offer.estimatedSavings,
      clientNotes: `Ofertă agregată acceptată prin Demand Pool. Economie estimată: ${offer.estimatedSavings.toLocaleString('ro-RO')} lei/an.`,
      operatorNotes: 'Clientul a acceptat oferta agregată. SAVE pregătește contractul de aderare.',
      counterOfferDetails: {
        proposedSupplier: offer.supplierName || 'Furnizor Partener',
        newAnnualCost: offer.proposedAnnualCost,
        estimatedSavings: offer.estimatedSavings,
        contractDurationMonths: offer.contractDurationMonths,
        termsSummary: offer.summary,
      },
      createdAt: now,
      updatedAt: now,
    };

    updateState((prev) => ({
      ...prev,
      clientOffers: prev.clientOffers.map((o) =>
        o.id === offerId ? { ...o, status: 'accepted' as const, acceptedAt: now } : o
      ),
      verifiedDemands: prev.verifiedDemands.map((d) =>
        d.id === offer.verifiedDemandId ? { ...d, status: 'accepted' as const } : d
      ),
      optimizationRequests: [newReq, ...prev.optimizationRequests],
    }));
  };

  const rejectClientOffer = async (offerId: string) => {
    const offer = state.clientOffers.find((o) => o.id === offerId);
    if (!offer) return;
    const now = new Date().toISOString();
    const isRealOrg = !state.currentOrg.isDemo;

    if (isRealOrg) {
      try {
        await supabase.from('client_offers').update({
          status: 'rejected',
          rejected_at: now,
        }).eq('id', offerId);
      } catch (e) {
        console.warn('Supabase reject offer notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      clientOffers: prev.clientOffers.map((o) =>
        o.id === offerId ? { ...o, status: 'rejected' as const, rejectedAt: now } : o
      ),
    }));
  };

  const submitSupplierBid = async (
    bidData: Omit<SupplierBid, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<SupplierBid> => {
    const bidId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bid_${Date.now()}`;
    const now = new Date().toISOString();
    const newBid: SupplierBid = {
      ...bidData,
      id: bidId,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('supplier_bids').insert({
          id: bidId,
          demand_pool_id: bidData.demandPoolId,
          marketplace_supplier_id: bidData.marketplaceSupplierId,
          pricing_model: bidData.pricingModel,
          price_per_unit: bidData.pricePerUnit,
          estimated_monthly_total: bidData.estimatedMonthlyTotal,
          estimated_annual_total: bidData.estimatedAnnualTotal,
          contract_duration_months: bidData.contractDurationMonths,
          minimum_volume: bidData.minimumVolume,
          sla_summary: bidData.slaSummary,
          benefits: bidData.benefits,
          conditions: bidData.conditions,
          attachment_url: bidData.attachmentUrl,
          valid_until: bidData.validUntil,
          status: 'submitted',
        });
      } catch (e) {
        console.warn('Supabase submit bid notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      supplierBids: [newBid, ...prev.supplierBids],
    }));

    return newBid;
  };

  const detectDemandsForCurrentOrg = async (): Promise<VerifiedDemand[]> => {
    const detected = detectVerifiedDemands({
      organizationId: state.currentOrg.id,
      organizationName: state.currentOrg.name,
      contracts: state.contracts.filter((c) => c.organizationId === state.currentOrg.id),
      spendRecords: state.spendRecords.filter((s) => s.organizationId === state.currentOrg.id),
      documents: state.documents.filter((d) => d.organizationId === state.currentOrg.id),
    });

    updateState((prev) => {
      const existingIds = new Set(prev.verifiedDemands.map((d) => d.id));
      const newOnly = detected.filter((d) => !existingIds.has(d.id));
      return {
        ...prev,
        verifiedDemands: [...newOnly, ...prev.verifiedDemands],
      };
    });

    return detected;
  };

  const updateVerifiedDemandStatus = async (demandId: string, newStatus: VerifiedDemandStatus) => {
    const isRealOrg = !state.currentOrg.isDemo;
    const now = new Date().toISOString();

    if (isRealOrg) {
      try {
        await supabase.from('verified_demands').update({
          status: newStatus,
          reviewed_by: state.currentUser.fullName,
          reviewed_at: now,
        }).eq('id', demandId);
      } catch (e) {
        console.warn('Supabase demand status update notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      verifiedDemands: prev.verifiedDemands.map((d) =>
        d.id === demandId
          ? {
              ...d,
              status: newStatus,
              reviewedBy: state.currentUser.fullName,
              reviewedAt: now,
              updatedAt: now,
            }
          : d
      ),
    }));
  };

  const createDemandPool = async (
    poolData: Omit<DemandPool, 'id' | 'createdAt' | 'updatedAt' | 'totalCompanies' | 'totalVolume' | 'totalCurrentAnnualSpend'>
  ): Promise<DemandPool> => {
    const poolId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pool_${Date.now()}`;
    const now = new Date().toISOString();
    const newPool: DemandPool = {
      ...poolData,
      id: poolId,
      totalCompanies: 0,
      totalVolume: 0,
      totalCurrentAnnualSpend: 0,
      createdAt: now,
      updatedAt: now,
    };

    if (!state.currentOrg.isDemo) {
      try {
        await supabase.from('demand_pools').insert({
          id: poolId,
          category: poolData.category,
          subcategory: poolData.subcategory,
          service_type: poolData.serviceType,
          title: poolData.title,
          region: poolData.region,
          currency: poolData.currency,
          status: poolData.status,
          bidding_starts_at: poolData.biddingStartsAt,
          bidding_ends_at: poolData.biddingEndsAt,
        });
      } catch (e) {
        console.warn('Supabase create pool notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      demandPools: [newPool, ...prev.demandPools],
    }));

    return newPool;
  };

  const selectWinningBidAndGenerateOffers = async (bidId: string) => {
    const bid = state.supplierBids.find((b) => b.id === bidId);
    if (!bid) return;
    const pool = state.demandPools.find((p) => p.id === bid.demandPoolId);
    if (!pool) return;

    const isRealOrg = !state.currentOrg.isDemo;
    const now = new Date().toISOString();

    const updatedBids = state.supplierBids.map((b) => {
      if (b.demandPoolId === bid.demandPoolId) {
        return {
          ...b,
          status: b.id === bidId ? ('selected' as const) : ('rejected' as const),
          updatedAt: now,
        };
      }
      return b;
    });

    const poolMembers = state.demandPoolMembers.filter(
      (m) => m.demandPoolId === pool.id && m.consentStatus === 'accepted'
    );

    const newOffers: ClientOffer[] = [];
    const updatedDemands = state.verifiedDemands.map((demand) => {
      const isMember = poolMembers.some((m) => m.verifiedDemandId === demand.id);
      if (isMember) {
        const proposedAnnual = Math.round(bid.pricePerUnit * demand.volume * 12);
        const estimatedSavings = Math.max(0, demand.currentAnnualCost - proposedAnnual);
        const savingsPercentage = demand.currentAnnualCost > 0
          ? Number(((estimatedSavings / demand.currentAnnualCost) * 100).toFixed(1))
          : 0;

        const offerId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `offer_${Date.now()}_${demand.organizationId}`;
        const offer: ClientOffer = {
          id: offerId,
          organizationId: demand.organizationId,
          verifiedDemandId: demand.id,
          demandPoolId: pool.id,
          supplierBidId: bid.id,
          supplierName: bid.marketplaceSupplierName || 'Furnizor Agregat Partener',
          currentAnnualCost: demand.currentAnnualCost,
          proposedAnnualCost: proposedAnnual,
          estimatedSavings,
          savingsPercentage,
          proposedUnitPrice: bid.pricePerUnit,
          unit: demand.unit,
          volume: demand.volume,
          contractDurationMonths: bid.contractDurationMonths,
          summary: `Ofertă colectivă obținută prin Demand Pool ${pool.title}. Tarif negociat la ${bid.pricePerUnit} lei/${demand.unit}/lună garantat pe ${bid.contractDurationMonths} luni.`,
          validUntil: bid.validUntil,
          status: 'offered',
          createdAt: now,
        };
        newOffers.push(offer);

        return {
          ...demand,
          status: 'offer_available' as const,
          updatedAt: now,
        };
      }
      return demand;
    });

    const updatedPools = state.demandPools.map((p) =>
      p.id === pool.id ? { ...p, status: 'offers_ready' as const, updatedAt: now } : p
    );

    if (isRealOrg) {
      try {
        await supabase.from('supplier_bids').update({ status: 'selected' }).eq('id', bidId);
        await supabase.from('demand_pools').update({ status: 'offers_ready' }).eq('id', pool.id);
        for (const off of newOffers) {
          await supabase.from('client_offers').insert({
            id: off.id,
            organization_id: off.organizationId,
            verified_demand_id: off.verifiedDemandId,
            demand_pool_id: off.demandPoolId,
            supplier_bid_id: off.supplierBidId,
            current_annual_cost: off.currentAnnualCost,
            proposed_annual_cost: off.proposedAnnualCost,
            estimated_savings: off.estimatedSavings,
            savings_percentage: off.savingsPercentage,
            proposed_unit_price: off.proposedUnitPrice,
            contract_duration_months: off.contractDurationMonths,
            summary: off.summary,
            valid_until: off.validUntil,
            status: 'offered',
          });
          await supabase.from('verified_demands').update({ status: 'offer_available' }).eq('id', off.verifiedDemandId);
        }
      } catch (e) {
        console.warn('Supabase select winning bid notice:', e);
      }
    }

    updateState((prev) => ({
      ...prev,
      supplierBids: updatedBids,
      demandPools: updatedPools,
      verifiedDemands: updatedDemands,
      clientOffers: [...newOffers, ...prev.clientOffers],
    }));
  };

  const orgFilteredDocuments = state.documents.filter((d) => d.organizationId === state.currentOrg.id);
  const orgFilteredContracts = state.contracts.filter((c) => c.organizationId === state.currentOrg.id);
  const orgFilteredOpportunities = state.opportunities.filter((o) => o.organizationId === state.currentOrg.id);
  const orgFilteredSpendRecords = state.spendRecords.filter((s) => s.organizationId === state.currentOrg.id);
  const orgFilteredRequests = state.optimizationRequests.filter((r) => r.organizationId === state.currentOrg.id);
  const orgFilteredVerifiedSavings = state.verifiedSavings.filter((v) => v.organizationId === state.currentOrg.id);
  const orgFilteredDemands = (state.verifiedDemands || []).filter((d) => d.organizationId === state.currentOrg.id);
  const orgFilteredPoolMembers = (state.demandPoolMembers || []).filter((m) => m.organizationId === state.currentOrg.id);
  const orgFilteredOffers = (state.clientOffers || []).filter((o) => o.organizationId === state.currentOrg.id);

  return (
    <SaveContext.Provider
      value={{
        state,
        currentOrg: state.currentOrg,
        currentUser: state.currentUser,
        organizations: state.organizations,
        documents: orgFilteredDocuments,
        contracts: orgFilteredContracts,
        opportunities: orgFilteredOpportunities,
        spendRecords: orgFilteredSpendRecords,
        optimizationRequests: orgFilteredRequests,
        verifiedSavings: orgFilteredVerifiedSavings,
        verifiedDemands: orgFilteredDemands,
        demandPools: state.demandPools || [],
        demandPoolMembers: orgFilteredPoolMembers,
        marketplaceSuppliers: state.marketplaceSuppliers || [],
        supplierBids: state.supplierBids || [],
        clientOffers: orgFilteredOffers,
        poolInterests: state.poolInterests || [],
        auditLogs: state.auditLogs,
        isHydrated,
        isDemoMode: isCurrentDemo,
        supabaseUser,
        switchOrganization,
        createOrganization,
        updateOrganization,
        submitPoolInterest,
        uploadDocument,
        updateExtraction,
        deleteDocument,
        createOptimizationRequest,
        updateOptimizationStatus,
        verifyOptimizationSavings,
        joinDemandPool,
        withdrawFromDemandPool,
        acceptClientOffer,
        rejectClientOffer,
        submitSupplierBid,
        detectDemandsForCurrentOrg,
        updateVerifiedDemandStatus,
        createDemandPool,
        selectWinningBidAndGenerateOffers,
        addContract,
        resetToDemo,
        signOut,
        refreshRealData,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
}

export function useSave() {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error('useSave must be used within a SaveProvider');
  }
  return context;
}
