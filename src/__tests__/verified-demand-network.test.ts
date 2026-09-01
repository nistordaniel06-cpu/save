import { describe, it, expect } from 'vitest';
import { 
  inferUnitAndService, 
  detectVerifiedDemands, 
  MVP_DEMAND_CATEGORIES 
} from '../lib/demand/demand-detector';
import { 
  MIN_ANONYMOUS_POOL_MEMBERS, 
  toAnonymousPoolView, 
  aggregatePoolMetrics 
} from '../lib/demand/pool-manager';
import { DemandPool, DemandPoolMember, VerifiedDemand, ContractItem, SpendRecord } from '../lib/types';

describe('SAVE v2 — Verified Demand & Demand Network', () => {
  it('correctly categorizes commercial units & service types for MVP categories', () => {
    const telecom = inferUnitAndService('Telecom', 'Vodafone Romania SA');
    expect(telecom.unit).toBe('SIM');
    expect(telecom.serviceType).toContain('SIM');

    const curierat = inferUnitAndService('Curierat', 'Fan Courier Express');
    expect(curierat.unit).toBe('parcel');
    expect(curierat.serviceType).toContain('Colete');

    const software = inferUnitAndService('Software', 'Microsoft Cloud');
    expect(software.unit).toBe('seat');
    expect(software.serviceType).toContain('Licențe');
  });

  it('detects verified demands from real contracts with notice deadlines', () => {
    const mockContracts: ContractItem[] = [
      {
        id: 'ctr_test_01',
        organizationId: 'org_01',
        supplierId: 'sup_vdf',
        supplierName: 'Vodafone Romania',
        category: 'Telecom',
        title: 'Abonamente Mobile 24 SIM',
        annualValue: 18400,
        currency: 'RON',
        startDate: '2025-12-01',
        expiryDate: '2026-11-30',
        noticePeriodDays: 30,
        noticeDeadline: '2026-10-31',
        automaticRenewal: true,
        status: 'active',
        paymentTerms: '30_days',
        createdAt: '2025-12-01T00:00:00Z',
      },
    ];

    const demands = detectVerifiedDemands({
      organizationId: 'org_01',
      organizationName: 'Test SRL',
      contracts: mockContracts,
    });

    expect(demands.length).toBe(1);
    const d = demands[0];
    expect(d.category).toBe('Telecom');
    expect(d.unit).toBe('SIM');
    expect(d.currentAnnualCost).toBe(18400);
    expect(d.currentMonthlyCost).toBe(Math.round(18400 / 12));
    expect(d.noticeDeadline).toBe('2026-10-31');
    expect(d.status).toBe('pool_eligible');
  });

  it('enforces privacy threshold: hides demand pool from suppliers if under 3 members', () => {
    expect(MIN_ANONYMOUS_POOL_MEMBERS).toBe(3);

    const smallPool: DemandPool = {
      id: 'pool_small',
      category: 'Telecom',
      serviceType: 'SIM',
      title: 'Pool Mic sub prag',
      region: 'Național',
      currency: 'RON',
      status: 'building',
      totalCompanies: 2, // only 2 companies
      totalVolume: 30,
      totalCurrentAnnualSpend: 25000,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    const hidden = toAnonymousPoolView(smallPool);
    expect(hidden).toBeNull(); // Strictly hidden from suppliers!

    const validPool: DemandPool = {
      ...smallPool,
      totalCompanies: 4, // 4 companies >= 3
      status: 'open_for_bids',
    };

    const visible = toAnonymousPoolView(validPool);
    expect(visible).not.toBeNull();
    expect(visible?.totalCompanies).toBe(4);
    expect(visible?.poolId).toBe('pool_small');
    // Spent rounded to protect individual client data
    expect(visible?.approximateAnnualSpend).toBe(25000);
    // Crucially: no company names or org IDs are present in the anonymous view
    expect((visible as any).organizationId).toBeUndefined();
    expect((visible as any).companyName).toBeUndefined();
  });

  it('aggregates pool metrics accurately when members join', () => {
    const initialPool: DemandPool = {
      id: 'pool_test',
      category: 'Curierat',
      serviceType: 'Colete',
      title: 'Grup Curierat',
      region: 'Național',
      currency: 'RON',
      status: 'building',
      totalCompanies: 0,
      totalVolume: 0,
      totalCurrentAnnualSpend: 0,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    const members: Array<{ member: DemandPoolMember; demand: VerifiedDemand }> = [
      {
        member: { id: 'm1', demandPoolId: 'pool_test', verifiedDemandId: 'd1', organizationId: 'org1', consentStatus: 'accepted', joinedAt: '2026-08-01' },
        demand: { id: 'd1', organizationId: 'org1', category: 'Curierat', serviceType: 'Colete', incumbentSupplierName: 'Fan Courier', currentMonthlyCost: 2000, currentAnnualCost: 24000, volume: 150, unit: 'parcel', confidenceScore: 90, status: 'pooled', createdAt: '', updatedAt: '' },
      },
      {
        member: { id: 'm2', demandPoolId: 'pool_test', verifiedDemandId: 'd2', organizationId: 'org2', consentStatus: 'accepted', joinedAt: '2026-08-02' },
        demand: { id: 'd2', organizationId: 'org2', category: 'Curierat', serviceType: 'Colete', incumbentSupplierName: 'DPD', currentMonthlyCost: 3500, currentAnnualCost: 42000, volume: 300, unit: 'parcel', confidenceScore: 90, status: 'pooled', createdAt: '', updatedAt: '' },
      },
      {
        member: { id: 'm3', demandPoolId: 'pool_test', verifiedDemandId: 'd3', organizationId: 'org3', consentStatus: 'accepted', joinedAt: '2026-08-03' },
        demand: { id: 'd3', organizationId: 'org3', category: 'Curierat', serviceType: 'Colete', incumbentSupplierName: 'Sameday', currentMonthlyCost: 1500, currentAnnualCost: 18000, volume: 100, unit: 'parcel', confidenceScore: 90, status: 'pooled', createdAt: '', updatedAt: '' },
      },
    ];

    const aggregated = aggregatePoolMetrics(initialPool, members);
    expect(aggregated.totalCompanies).toBe(3);
    expect(aggregated.totalVolume).toBe(550); // 150 + 300 + 100
    expect(aggregated.totalCurrentAnnualSpend).toBe(84000); // 24k + 42k + 18k
    expect(aggregated.status).toBe('ready'); // transitioned to ready because companies >= 3
  });
});
