import { describe, it, expect } from 'vitest';
import { calculateSpendSummary } from '../lib/analytics/spend-calculator';
import { DEMO_SPEND_RECORDS } from '../lib/demo-data';
import { SpendRecord } from '../lib/types';

describe('Spend Calculator Analytics', () => {
  it('correctly aggregates and annualizes demo spend records', () => {
    const summary = calculateSpendSummary(DEMO_SPEND_RECORDS);

    expect(summary.totalAnnualSpendRon).toBeGreaterThan(350000);
    expect(summary.monthlyRunRateRon).toBeGreaterThan(25000);
    expect(summary.recurringPercentage).toBeGreaterThanOrEqual(80);
    expect(summary.supplierBreakdown.length).toBeGreaterThanOrEqual(5);
  });

  it('handles empty spend records gracefully without dividing by zero', () => {
    const emptySummary = calculateSpendSummary([]);

    expect(emptySummary.totalAnnualSpendRon).toBe(0);
    expect(emptySummary.monthlyRunRateRon).toBe(0);
    expect(emptySummary.recurringSpendRon).toBe(0);
    expect(emptySummary.recurringPercentage).toBe(0);
    expect(emptySummary.supplierBreakdown).toEqual([]);
  });

  it('correctly partitions recurring vs variable spend', () => {
    const mockRecords: SpendRecord[] = [
      {
        id: '1',
        organizationId: 'org_1',
        supplierId: 'sup_1',
        supplierName: 'Furnizor Recurring',
        category: 'Software',
        description: 'Licenta lunara',
        amount: 1000,
        currency: 'RON',
        spendDate: '2026-08-01',
        isRecurring: true,
        periodType: 'monthly',
        createdAt: '2026-08-01',
      },
      {
        id: '2',
        organizationId: 'org_1',
        supplierId: 'sup_2',
        supplierName: 'Furnizor Spot',
        category: 'Consumabile',
        description: 'Achizitie spot',
        amount: 500,
        currency: 'RON',
        spendDate: '2026-08-01',
        isRecurring: false,
        periodType: 'one_off',
        createdAt: '2026-08-01',
      },
    ];

    const summary = calculateSpendSummary(mockRecords);
    expect(summary.totalAnnualSpendRon).toBe(18000); // (1000 + 500) * 12
    expect(summary.recurringSpendRon).toBe(12000); // 1000 * 12
    expect(summary.variableSpendRon).toBe(6000); // 500 * 12
    expect(summary.recurringPercentage).toBe(67);
  });
});
