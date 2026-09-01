import { describe, it, expect } from 'vitest';
import { calculateSpendSummary } from '../lib/analytics/spend-calculator';
import { calculateSavingsSummary, calculateSaveScore } from '../lib/analytics/savings-calculator';
import { calculateContractRadar } from '../lib/analytics/contract-calculator';
import { detectVerifiedDemands } from '../lib/demand/demand-detector';
import { aggregatePoolMetrics, toAnonymousPoolView } from '../lib/demand/pool-manager';
import { DemandPool } from '../lib/types';

describe('New User & Empty State Resilience Flow', () => {
  it('handles empty spend records cleanly with 0 run-rate and empty breakdown', () => {
    const summary = calculateSpendSummary([]);
    expect(summary.totalAnnualSpendRon).toBe(0);
    expect(summary.monthlyRunRateRon).toBe(0);
    expect(summary.recurringPercentage).toBe(0);
    expect(summary.supplierBreakdown).toEqual([]);
    expect(summary.categoryBreakdown.Telecom.amount).toBe(0);
    expect(summary.categoryBreakdown.Curierat.amount).toBe(0);
  });

  it('handles empty opportunities & verified savings without NaN', () => {
    const summary = calculateSavingsSummary([], [], 0);
    expect(summary.openOpportunitiesCount).toBe(0);
    expect(summary.estimatedSavingsMidpointRon).toBe(0);
    expect(summary.verifiedSavingsRon).toBe(0);
    expect(summary.estimatedSavingsPercentage).toBe(0);
  });

  it('calculates a neutral SAVE score for new users without throwing or returning NaN', () => {
    const score = calculateSaveScore(0, [], []);
    expect(score.totalScore).toBeGreaterThanOrEqual(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(Number.isNaN(score.totalScore)).toBe(false);
    expect(score.headline).toContain('Date insuficiente');
    expect(score.grade).toBe('C');
  });

  it('handles empty contract registry cleanly in renewal radar', () => {
    const radar = calculateContractRadar([]);
    expect(radar.totalContracts).toBe(0);
    expect(radar.expiringIn30Days).toEqual([]);
    expect(radar.expiringIn60Days).toEqual([]);
    expect(radar.autoRenewalCount).toBe(0);
    expect(radar.totalAnnualValueRon).toBe(0);
  });

  it('demand detector returns clean empty list for new users without contracts or spend', () => {
    const demands = detectVerifiedDemands({
      organizationId: 'new_org_123',
      organizationName: 'Brand New SME SRL',
      contracts: [],
      spendRecords: [],
    });
    expect(demands).toEqual([]);
  });

  it('handles empty pool metrics aggregation and hides empty pool from marketplace suppliers', () => {
    const freshPool: DemandPool = {
      id: 'pool_new',
      category: 'Telecom',
      serviceType: 'Flotă SIM',
      title: 'Pool Nou Fără Membri',
      region: 'Național',
      currency: 'RON',
      status: 'building',
      totalCompanies: 0,
      totalVolume: 0,
      totalCurrentAnnualSpend: 0,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    const aggregated = aggregatePoolMetrics(freshPool, []);
    expect(aggregated.totalCompanies).toBe(0);
    expect(aggregated.totalVolume).toBe(0);
    expect(aggregated.totalCurrentAnnualSpend).toBe(0);
    expect(aggregated.status).toBe('building');

    // Supplier privacy gate: 0 members must remain strictly hidden
    const view = toAnonymousPoolView(aggregated);
    expect(view).toBeNull();
  });
});
