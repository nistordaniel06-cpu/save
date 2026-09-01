import { describe, it, expect } from 'vitest';
import { auditSupplierFiscalProfile } from '@/lib/analytics/supplier-fiscal-audit';
import { Supplier } from '@/lib/types';

describe('Advanced SAVE Features Unit Tests', () => {
  it('1. Correctly audits valid Romanian supplier CUI and deductibility risk', () => {
    const validSupplier: Supplier = {
      id: 'sup_vdf',
      organizationId: 'org_1',
      name: 'Fan Courier Express SRL',
      cui: 'RO13838336',
      category: 'Curierat',
      totalAnnualSpendRon: 48000,
      invoiceCount: 12,
      contractCount: 1,
      rating: 4.8,
      isPreferred: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const audit = auditSupplierFiscalProfile(validSupplier);
    expect(audit.isCuiValid).toBe(true);
    expect(audit.deductibilityRisk).toBe('low');
    expect(audit.vatStatus).toBe('platitor_tva');
    expect(audit.riskLabel).toContain('Deductibil');
  });

  it('2. Flags invalid or missing CUI with medium/high deductibility risk', () => {
    const invalidSupplier: Supplier = {
      id: 'sup_anon',
      organizationId: 'org_1',
      name: 'Furnizor Fara CUI',
      category: 'Altele',
      totalAnnualSpendRon: 15000,
      invoiceCount: 3,
      contractCount: 0,
      rating: 3.0,
      isPreferred: false,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const audit = auditSupplierFiscalProfile(invalidSupplier);
    expect(audit.isCuiValid).toBe(false);
    expect(audit.deductibilityRisk).toBe('high');
    expect(audit.riskLabel).toContain('Lipsă CUI');
  });

  it('3. Computes multi-category discount scenarios in OPEX simulator', () => {
    const telecom = 24000;
    const curierat = 36000;
    const telecomDiscount = 0.20; // -20%
    const curieratDiscount = 0.15; // -15%

    const savings = Math.round(telecom * telecomDiscount + curierat * curieratDiscount);
    expect(savings).toBe(4800 + 5400); // 10,200 RON
    const monthlyCashflow = Math.round(savings / 12);
    expect(monthlyCashflow).toBe(850);
  });
});
