import { describe, it, expect } from 'vitest';
import { calculateSavingsSummary, calculateSaveScore } from '../lib/analytics/savings-calculator';
import { DEMO_SAVINGS_OPPORTUNITIES, DEMO_CONTRACTS } from '../lib/demo-data';
import { SavingsOpportunity, VerifiedSavingsItem } from '../lib/types';

describe('Savings Calculator Analytics', () => {
  it('correctly calculates total potential savings range from open opportunities', () => {
    const summary = calculateSavingsSummary(DEMO_SAVINGS_OPPORTUNITIES, [], 428500);

    expect(summary.estimatedSavingsMinRon).toBe(18900); // 2800 + 12500 + 3600
    expect(summary.estimatedSavingsMaxRon).toBe(26100); // 4100 + 16800 + 5200
    expect(summary.openOpportunitiesCount).toBe(3);
    expect(summary.verifiedSavingsRon).toBe(0);
    expect(summary.savingsByConfidence.high).toBeGreaterThan(0);
  });

  it('correctly aggregates verified savings', () => {
    const verifiedList: VerifiedSavingsItem[] = [
      {
        id: 'v1',
        organizationId: 'org_1',
        supplierName: 'Vodafone',
        category: 'Telecom',
        verifiedAmountAnnual: 3900,
        currency: 'RON',
        verificationMethod: 'contract_signed',
        verifiedAt: '2026-08-31',
      },
    ];

    const summary = calculateSavingsSummary(DEMO_SAVINGS_OPPORTUNITIES, verifiedList, 428500);
    expect(summary.verifiedSavingsRon).toBe(3900);
  });

  it('computes transparent SAVE score with 4 distinct pillars', () => {
    const scoreData = calculateSaveScore(428500, DEMO_CONTRACTS, DEMO_SAVINGS_OPPORTUNITIES);

    expect(scoreData.totalScore).toBeGreaterThanOrEqual(0);
    expect(scoreData.totalScore).toBeLessThanOrEqual(100);
    expect(scoreData.factors.contractCoverage.score).toBeGreaterThan(0);
    expect(scoreData.factors.benchmarkCompetitiveness.score).toBeGreaterThan(0);
    expect(scoreData.factors.supplierConsolidation.score).toBeGreaterThan(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(scoreData.grade);
  });

  it('returns neutral message when real organization has insufficient data', () => {
    const emptyScore = calculateSaveScore(0, [], []);
    expect(emptyScore.totalScore).toBe(50);
    expect(emptyScore.headline).toContain('Date insuficiente');
  });
});
