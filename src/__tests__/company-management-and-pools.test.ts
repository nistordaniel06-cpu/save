import { describe, it, expect } from 'vitest';
import { validateAndNormalizeCui } from '@/lib/company-lookup/cui-validator';
import { Organization, PoolInterest } from '@/lib/types';
import { getEmptyRealState, getDefaultDemoState } from '@/lib/store';

describe('Company Management & Pools Logic', () => {
  it('correctly models company verification statuses and audit metadata', () => {
    const org: Organization = {
      id: 'org_test_101',
      name: 'Alpha Logistics SRL',
      cui: 'RO14399840',
      industry: 'Transport & Logistică',
      employeeRange: '10-49',
      monthlyOpexRon: 45000,
      saveScore: 78,
      isDemo: false,
      currency: 'RON',
      createdAt: new Date().toISOString(),
      verificationStatus: 'unverified',
    };

    expect(org.verificationStatus).toBe('unverified');

    // Admin verifies org
    const verifiedOrg: Organization = {
      ...org,
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'admin@save.ro',
      companyLookupSource: 'ANAF',
      companyLookupStatus: 'active',
      vatRegistered: true,
    };

    expect(verifiedOrg.verificationStatus).toBe('verified');
    expect(verifiedOrg.verifiedBy).toBe('admin@save.ro');
    expect(verifiedOrg.vatRegistered).toBe(true);
  });

  it('correctly models pool interest submissions', () => {
    const interest: PoolInterest = {
      id: 'pool_int_01',
      organizationId: 'org_test_101',
      category: 'Curierat',
      estimatedSpend: 6500,
      estimatedVolume: 450,
      unit: 'colete / lună',
      notes: 'Expedieri naționale standard cu asigurare inclusă',
      status: 'interested',
      createdAt: new Date().toISOString(),
    };

    expect(interest.category).toBe('Curierat');
    expect(interest.estimatedSpend).toBe(6500);
    expect(interest.status).toBe('interested');
  });

  it('ensures real state starts with zero pool interests and demo state is isolated', () => {
    const realState = getEmptyRealState();
    expect(realState.poolInterests).toEqual([]);
    expect(realState.organizations).toEqual([]);

    const demoState = getDefaultDemoState();
    expect(demoState.currentOrg.isDemo).toBe(true);
  });

  it('validates CUI normalization for various real Romanian formats', () => {
    const res1 = validateAndNormalizeCui('RO 14399840');
    expect(res1.isValid).toBe(true);
    expect(res1.cuiNumeric).toBe(14399840);
    expect(res1.cuiFormatted).toBe('RO14399840');

    const res2 = validateAndNormalizeCui('1590120');
    expect(res2.isValid).toBe(true);
    expect(res2.cuiNumeric).toBe(1590120);

    const res3 = validateAndNormalizeCui('invalid-cui-123');
    expect(res3.isValid).toBe(false);
    expect(res3.errorMessage).toBeDefined();
  });
});
