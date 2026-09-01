'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AppState, 
  getInitialState, 
  getSavedState,
  saveState, 
  resetDemoState 
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
  SpendCategory
} from './types';
import { processDocumentExtraction } from './ai/extractor';
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
  auditLogs: AuditEvent[];
  isHydrated: boolean;
  isDemoMode: boolean;
  supabaseUser: any | null;
  switchOrganization: (orgId: string) => void;
  createOrganization: (orgData: Partial<Organization>) => Promise<Organization>;
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
  addContract: (contract: Omit<ContractItem, 'id' | 'organizationId' | 'createdAt'>) => Promise<ContractItem>;
  resetToDemo: () => void;
  signOut: () => Promise<void>;
  refreshRealData: () => Promise<void>;
}

const SaveContext = createContext<SaveContextType | null>(null);

export function SaveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);
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
        saveState(next);
        return next;
      });
    } catch (e) {
      console.warn('Error fetching org data from Supabase:', e);
    }
  };

  const loadUserOrganizations = async (userId: string) => {
    try {
      const { data: members, error: memErr } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(*)')
        .eq('user_id', userId);

      if (!memErr && members && members.length > 0) {
        const realOrgs: Organization[] = members.map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          cui: m.organizations.cui,
          registrationNumber: m.organizations.registration_number,
          industry: m.organizations.industry || 'Servicii & B2B',
          employeeRange: m.organizations.employee_range || '10-49',
          monthlyOpexRon: Number(m.organizations.monthly_opex_ron) || 0,
          saveScore: m.organizations.save_score || 70,
          isDemo: false,
          currency: m.organizations.currency || 'RON',
          createdAt: m.organizations.created_at,
        }));

        setState((prev) => {
          const allOrgs = [DEMO_ORG, ...realOrgs];
          // If current was demo or first login, switch to user's real org
          const nextCurrent = realOrgs[0] || prev.currentOrg;
          const next = {
            ...prev,
            organizations: allOrgs,
            currentOrg: nextCurrent,
            currentUser: {
              id: userId,
              email: supabaseUser?.email || prev.currentUser.email,
              fullName: supabaseUser?.user_metadata?.full_name || prev.currentUser.fullName,
              role: 'Director Financiar (Owner)',
              createdAt: new Date().toISOString(),
            },
          };
          saveState(next);
          return next;
        });

        // Load real data for current org
        if (realOrgs[0]) {
          await fetchOrgDataFromSupabase(realOrgs[0].id);
        }
      }
    } catch (e) {
      console.warn('Could not load user organizations from Supabase, using local state:', e);
    }
  };

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    const saved = getSavedState();
    if (saved) {
      setState(saved);
    }
    setIsHydrated(true);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSupabaseUser(user);
        loadUserOrganizations(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await loadUserOrganizations(session.user.id);
      } else {
        setSupabaseUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);



  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
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
        const { data: dbOrg, error: orgErr } = await supabase
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
          })
          .select()
          .single();

        if (!orgErr) {
          // Link member
          await supabase.from('organization_members').insert({
            organization_id: orgId,
            user_id: user.id,
            role: 'owner',
          });
        }
      }
    } catch (e) {
      console.warn('Supabase organization insert fallback to local:', e);
    }

    updateState((prev) => ({
      ...prev,
      organizations: [...prev.organizations, newOrg],
      currentOrg: newOrg,
    }));

    return newOrg;
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
    const fresh = resetDemoState();
    setState(fresh);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    resetToDemo();
  };

  const refreshRealData = async () => {
    if (!state.currentOrg.isDemo) {
      await fetchOrgDataFromSupabase(state.currentOrg.id);
    }
  };

  const isDemoMode = state.currentOrg.isDemo;

  const orgFilteredDocuments = state.documents.filter((d) => d.organizationId === state.currentOrg.id);
  const orgFilteredContracts = state.contracts.filter((c) => c.organizationId === state.currentOrg.id);
  const orgFilteredOpportunities = state.opportunities.filter((o) => o.organizationId === state.currentOrg.id);
  const orgFilteredSpendRecords = state.spendRecords.filter((s) => s.organizationId === state.currentOrg.id);
  const orgFilteredRequests = state.optimizationRequests.filter((r) => r.organizationId === state.currentOrg.id);
  const orgFilteredVerifiedSavings = state.verifiedSavings.filter((v) => v.organizationId === state.currentOrg.id);

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
        auditLogs: state.auditLogs,
        isHydrated,
        isDemoMode,
        supabaseUser,
        switchOrganization,
        createOrganization,
        uploadDocument,
        updateExtraction,
        deleteDocument,
        createOptimizationRequest,
        updateOptimizationStatus,
        verifyOptimizationSavings,
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
