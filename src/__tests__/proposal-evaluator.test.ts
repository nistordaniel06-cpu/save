import { describe, it, expect } from 'vitest';
import { evaluateSupplierProposal } from '../lib/analytics/proposal-evaluator';
import { generateNegotiationLetter } from '../lib/analytics/negotiation-letter';

describe('Proposal Agent & Negotiation Letter Engine (Tropic Inspired)', () => {
  it('correctly identifies overpriced supplier proposals against Romanian benchmarks', () => {
    const evaluation = evaluateSupplierProposal({
      supplierName: 'Fan Courier Express SRL',
      category: 'Curierat',
      proposedAnnualCost: 105000,
      unitPrice: 14.50, // P50 is 11.80, so 14.50 is overpriced (>22%)
      quantity: 600,
      automaticRenewal: true,
      priceIndexation: true,
    });

    expect(evaluation.verdict).toBe('overpriced');
    expect(evaluation.potentialAnnualSavings).toBeGreaterThan(0);
    expect(evaluation.savingsPercentage).toBeGreaterThan(15);
    expect(evaluation.priceVarianceFromMedianPercent).toBeGreaterThan(20);
    expect(evaluation.counterOfferStrategy.contractClausesToEliminate.length).toBeGreaterThan(0);
  });

  it('correctly identifies competitive proposals with moderate savings margin', () => {
    const evaluation = evaluateSupplierProposal({
      supplierName: 'Vodafone Romania SA',
      category: 'Telecom',
      proposedAnnualCost: 23280,
      unitPrice: 48.50, // Exactly P50 median
      quantity: 40,
    });

    expect(evaluation.verdict).toBe('competitive');
    expect(evaluation.potentialAnnualSavings).toBeGreaterThanOrEqual(0);
  });

  it('generates a formal Romanian B2B negotiation letter with specific numbers and clauses', () => {
    const letter = generateNegotiationLetter({
      companyName: 'Nova Retail SRL',
      companyCui: 'RO 38491024',
      supplierName: 'Fan Courier Express SRL',
      category: 'Curierat',
      currentOrProposedCostAnnual: 105000,
      targetCostAnnual: 77760,
      expectedSavingsAnnual: 27240,
      contactPersonName: 'Mihai Ionescu',
      contactPersonRole: 'Director Financiar (CFO)',
    });

    expect(letter).toContain('SCRISOARE OFICIALĂ DE NEGOCIERE');
    expect(letter).toContain('Nova Retail SRL (CUI: RO 38491024)');
    expect(letter).toContain('Fan Courier Express SRL');
    expect(letter).toContain('105.000 RON / an');
    expect(letter).toContain('77.760 RON / an');
    expect(letter).toContain('27.240 RON / an');
    expect(letter).toContain('Mihai Ionescu');
  });
});
