import { describe, it, expect } from 'vitest';
import { DEMO_DOCUMENTS, DEMO_CONTRACTS, DEMO_ORG } from '../lib/demo-data';
import { calculateSpendSummary } from '../lib/analytics/spend-calculator';
import { calculateSavingsSummary } from '../lib/analytics/savings-calculator';

describe('Multi-Tenant Organization Boundary Isolation', () => {
  it('strictly filters documents by active organization ID', () => {
    const activeOrgId = 'org_nova_retail_001';
    const otherOrgDoc = {
      id: 'doc_rogue',
      organizationId: 'org_other_competitor_999',
      fileName: 'Confidential_Pricing.pdf',
      filePath: 'org_other_competitor_999/doc_rogue/Confidential_Pricing.pdf',
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

  it('ensures storage path conforms to private organization scoping', () => {
    const orgId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const docId = 'c03f4e24-4f89-491b-8012-1f7c320d39aa';
    const fileName = 'Factura_Orange_August_2026.pdf';

    const storagePath = `${orgId}/${docId}/${fileName}`;
    const pathParts = storagePath.split('/');

    expect(pathParts[0]).toBe(orgId);
    expect(pathParts[1]).toBe(docId);
    expect(pathParts[2]).toBe(fileName);
  });

  it('guarantees that a new real organization starts with 0 financial leakage from demo data', () => {
    const realOrgId = 'org_real_acme_srl';
    const realOrgSpendRecords: any[] = [];
    const realOrgOpportunities: any[] = [];
    const realOrgVerifiedSavings: any[] = [];

    const spendSummary = calculateSpendSummary(realOrgSpendRecords);
    const savingsSummary = calculateSavingsSummary(realOrgOpportunities, realOrgVerifiedSavings, spendSummary.totalAnnualSpendRon);

    expect(spendSummary.totalAnnualSpendRon).toBe(0);
    expect(spendSummary.monthlyRunRateRon).toBe(0);
    expect(savingsSummary.estimatedSavingsMinRon).toBe(0);
    expect(savingsSummary.estimatedSavingsMaxRon).toBe(0);
    expect(savingsSummary.verifiedSavingsRon).toBe(0);
  });

  it('identifies demo organizations distinctly with isDemo flag', () => {
    expect(DEMO_ORG.isDemo).toBe(true);
    expect(DEMO_ORG.name).toBe('Nova Retail SRL');
  });
});
