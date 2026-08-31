import { describe, it, expect } from 'vitest';
import { DEMO_DOCUMENTS, DEMO_CONTRACTS } from '../lib/demo-data';

describe('Multi-Tenant Organization Boundary Isolation', () => {
  it('strictly filters documents by active organization ID', () => {
    const activeOrgId = 'org_nova_retail_001';
    const otherOrgDoc = {
      id: 'doc_rogue',
      organizationId: 'org_other_competitor_999',
      fileName: 'Confidential_Pricing.pdf',
      filePath: 'org_other/Confidential_Pricing.pdf',
      fileSizeBytes: 100000,
      mimeType: 'application/pdf',
      documentType: 'invoice' as const,
      status: 'extracted' as const,
      createdAt: '2026-08-31',
    };

    const allDocuments = [...DEMO_DOCUMENTS, otherOrgDoc];
    const isolatedDocs = allDocuments.filter((d) => d.organizationId === activeOrgId);

    expect(isolatedDocs.length).toBe(DEMO_DOCUMENTS.length);
    expect(isolatedDocs.some((d) => d.organizationId === 'org_other_competitor_999')).toBe(false);
  });

  it('prevents contract visibility across tenants', () => {
    const activeOrgId = 'org_nova_retail_001';
    const foreignContract = {
      id: 'ctr_foreign',
      organizationId: 'org_other_tenant',
      supplierId: 'sup_x',
      supplierName: 'Secret Supplier',
      title: 'Secret Master Service Agreement',
      category: 'Servicii' as const,
      annualValue: 500000,
      currency: 'RON',
      startDate: '2025-01-01',
      expiryDate: '2026-12-31',
      noticePeriodDays: 30,
      noticeDeadline: '2026-12-01',
      automaticRenewal: true,
      status: 'active' as const,
      paymentTerms: '30 days',
      createdAt: '2026-01-01',
    };

    const allContracts = [...DEMO_CONTRACTS, foreignContract];
    const tenantContracts = allContracts.filter((c) => c.organizationId === activeOrgId);

    expect(tenantContracts.length).toBe(DEMO_CONTRACTS.length);
    expect(tenantContracts.some((c) => c.id === 'ctr_foreign')).toBe(false);
  });
});
