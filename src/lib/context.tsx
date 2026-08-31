'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AppState, 
  getInitialState, 
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
  switchOrganization: (orgId: string) => void;
  createOrganization: (orgData: Partial<Organization>) => Organization;
  uploadDocument: (file: { name: string; type: string; size: number; textSnippet?: string }) => Promise<DocumentItem>;
  updateExtraction: (documentId: string, updatedExtraction: Partial<DocumentExtraction>) => void;
  deleteDocument: (documentId: string) => void;
  createOptimizationRequest: (data: {
    opportunityId?: string;
    supplierId?: string;
    supplierName: string;
    initialAnnualCost: number;
    clientNotes?: string;
  }) => OptimizationRequest;
  updateOptimizationStatus: (
    requestId: string, 
    newStatus: OptimizationStatus, 
    options?: {
      operatorNotes?: string;
      achievedAnnualSavings?: number;
      counterOfferDetails?: OptimizationRequest['counterOfferDetails'];
    }
  ) => void;
  verifyOptimizationSavings: (requestId: string, amountRon: number) => void;
  addContract: (contract: Omit<ContractItem, 'id' | 'organizationId' | 'createdAt'>) => ContractItem;
  resetToDemo: () => void;
}

const SaveContext = createContext<SaveContextType | null>(null);

export function SaveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initial = getInitialState();
    setState(initial);
    setIsHydrated(true);
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
    }
  };

  const createOrganization = (orgData: Partial<Organization>): Organization => {
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: orgData.name || 'Companie Nouă SRL',
      cui: orgData.cui || 'RO 00000000',
      industry: orgData.industry || 'Servicii & Tehnologie',
      employeeRange: orgData.employeeRange || '10-49',
      monthlyOpexRon: orgData.monthlyOpexRon || 25000,
      saveScore: 65,
      isDemo: false,
      currency: 'RON',
      createdAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      organizations: [...prev.organizations, newOrg],
      currentOrg: newOrg,
    }));

    return newOrg;
  };

  const uploadDocument = async (file: { name: string; type: string; size: number; textSnippet?: string }): Promise<DocumentItem> => {
    const docId = `doc_${Date.now()}`;
    const newDoc: DocumentItem = {
      id: docId,
      organizationId: state.currentOrg.id,
      fileName: file.name,
      filePath: `${state.currentOrg.id}/uploads/${file.name}`,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/pdf',
      documentType: file.name.toLowerCase().includes('contract') ? 'supplier_contract' : 'invoice',
      status: 'processing',
      uploadedByName: state.currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    // Insert with processing status
    updateState((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }));

    // Trigger AI extraction pipeline
    const { extraction, isValid } = await processDocumentExtraction({
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      textContent: file.textSnippet,
    });

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

    // Update document and record audit event
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

      // Also create a spend record if it's a valid invoice
      let updatedSpend = prev.spendRecords;
      if (extraction.documentType === 'invoice' || extraction.documentType === 'subscription_agreement') {
        const newSpendRecord: SpendRecord = {
          id: `sp_${Date.now()}`,
          organizationId: prev.currentOrg.id,
          supplierId: `sup_${Date.now()}`,
          supplierName: extraction.supplier,
          documentId: docId,
          category: extraction.category as SpendCategory,
          description: `Factură ${file.name}`,
          amount: extraction.invoiceTotal,
          currency: extraction.currency,
          spendDate: extraction.invoiceDate || new Date().toISOString().split('T')[0],
          isRecurring: true,
          periodType: 'monthly',
          createdAt: new Date().toISOString(),
        };
        updatedSpend = [newSpendRecord, ...prev.spendRecords];
      }

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

  const updateExtraction = (documentId: string, updatedExtraction: Partial<DocumentExtraction>) => {
    updateState((prev) => {
      const updatedDocs = prev.documents.map((d) => {
        if (d.id === documentId && d.extraction) {
          const merged: DocumentExtraction = {
            ...d.extraction,
            ...updatedExtraction,
            needsReview: false,
            reviewedBy: prev.currentUser.id,
            reviewedAt: new Date().toISOString(),
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

      const audit: AuditEvent = {
        id: `aud_${Date.now()}`,
        organizationId: prev.currentOrg.id,
        actorId: prev.currentUser.id,
        actorName: prev.currentUser.fullName,
        action: 'document.manual_review_completed',
        entityType: 'document',
        entityId: documentId,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        documents: updatedDocs,
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  };

  const deleteDocument = (documentId: string) => {
    updateState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== documentId),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          organizationId: prev.currentOrg.id,
          actorId: prev.currentUser.id,
          actorName: prev.currentUser.fullName,
          action: 'document.deleted',
          entityType: 'document',
          entityId: documentId,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const createOptimizationRequest = (data: {
    opportunityId?: string;
    supplierId?: string;
    supplierName: string;
    initialAnnualCost: number;
    clientNotes?: string;
  }): OptimizationRequest => {
    const opp = state.opportunities.find((o) => o.id === data.opportunityId);
    const newReq: OptimizationRequest = {
      id: `opt_req_${Date.now()}`,
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

    updateState((prev) => {
      // Mark opportunity as requested
      const updatedOpps = prev.opportunities.map((o) =>
        o.id === data.opportunityId ? { ...o, status: 'requested' as const } : o
      );

      const audit: AuditEvent = {
        id: `aud_${Date.now()}`,
        organizationId: prev.currentOrg.id,
        actorId: prev.currentUser.id,
        actorName: prev.currentUser.fullName,
        action: 'optimization.requested',
        entityType: 'optimization_request',
        entityId: newReq.id,
        metadata: { supplier: data.supplierName, initialCost: data.initialAnnualCost },
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        opportunities: updatedOpps,
        optimizationRequests: [newReq, ...prev.optimizationRequests],
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    return newReq;
  };

  const updateOptimizationStatus = (
    requestId: string,
    newStatus: OptimizationStatus,
    options?: {
      operatorNotes?: string;
      achievedAnnualSavings?: number;
      counterOfferDetails?: OptimizationRequest['counterOfferDetails'];
    }
  ) => {
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

  const verifyOptimizationSavings = (requestId: string, amountRon: number) => {
    const req = state.optimizationRequests.find((r) => r.id === requestId);
    if (!req) return;

    const verifiedItem: VerifiedSavingsItem = {
      id: `ver_${Date.now()}`,
      organizationId: req.organizationId,
      optimizationRequestId: requestId,
      supplierId: req.supplierId,
      supplierName: req.supplierName || 'Furnizor Optimizat',
      category: 'Telecom', // Default or derived
      verifiedAmountAnnual: amountRon,
      currency: 'RON',
      verificationMethod: 'contract_renegotiated_signed',
      verifiedBy: state.currentUser.fullName,
      verifiedAt: new Date().toISOString(),
    };

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

  const addContract = (contractData: Omit<ContractItem, 'id' | 'organizationId' | 'createdAt'>): ContractItem => {
    const timeline = calculateContractTimeline(contractData);
    const newContract: ContractItem = {
      ...contractData,
      id: `ctr_${Date.now()}`,
      organizationId: state.currentOrg.id,
      daysUntilExpiry: timeline.daysUntilExpiry,
      noticeDeadline: timeline.noticeDeadline,
      daysUntilNotice: timeline.daysUntilNotice,
      createdAt: new Date().toISOString(),
    };

    updateState((prev) => ({
      ...prev,
      contracts: [newContract, ...prev.contracts],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          organizationId: prev.currentOrg.id,
          actorId: prev.currentUser.id,
          actorName: prev.currentUser.fullName,
          action: 'contract.created',
          entityType: 'contract',
          entityId: newContract.id,
          metadata: { title: newContract.title, annualValue: newContract.annualValue },
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return newContract;
  };

  const resetToDemo = () => {
    const fresh = resetDemoState();
    setState(fresh);
  };

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
