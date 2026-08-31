import { SavingsOpportunity, VerifiedSavingsItem, ContractItem, SaveScoreBreakdown } from '../types';

export interface SavingsSummary {
  estimatedSavingsMinRon: number;
  estimatedSavingsMaxRon: number;
  estimatedSavingsMidpointRon: number;
  estimatedSavingsPercentage: number;
  openOpportunitiesCount: number;
  verifiedSavingsRon: number;
  savingsByConfidence: {
    high: number;
    medium: number;
    low: number;
  };
  savingsByCategory: Record<string, number>;
}

export function calculateSavingsSummary(
  opportunities: SavingsOpportunity[],
  verifiedItems: VerifiedSavingsItem[] = [],
  totalAnnualSpendRon: number = 428500
): SavingsSummary {
  const openOpps = (opportunities || []).filter((o) => o.status === 'open' || o.status === 'in_progress');

  let estimatedSavingsMinRon = 0;
  let estimatedSavingsMaxRon = 0;
  const savingsByConfidence = { high: 0, medium: 0, low: 0 };
  const savingsByCategory: Record<string, number> = {};

  openOpps.forEach((opp) => {
    estimatedSavingsMinRon += opp.estimatedSavingsMin;
    estimatedSavingsMaxRon += opp.estimatedSavingsMax;

    const oppMid = (opp.estimatedSavingsMin + opp.estimatedSavingsMax) / 2;
    savingsByConfidence[opp.confidenceLevel] = (savingsByConfidence[opp.confidenceLevel] || 0) + oppMid;
    savingsByCategory[opp.category] = (savingsByCategory[opp.category] || 0) + oppMid;
  });

  const estimatedSavingsMidpointRon = Math.round((estimatedSavingsMinRon + estimatedSavingsMaxRon) / 2);
  const estimatedSavingsPercentage = totalAnnualSpendRon > 0 
    ? Number(((estimatedSavingsMidpointRon / totalAnnualSpendRon) * 100).toFixed(1))
    : 0;

  const verifiedSavingsRon = (verifiedItems || []).reduce((sum, item) => sum + item.verifiedAmountAnnual, 0);

  return {
    estimatedSavingsMinRon,
    estimatedSavingsMaxRon,
    estimatedSavingsMidpointRon,
    estimatedSavingsPercentage,
    openOpportunitiesCount: openOpps.length,
    verifiedSavingsRon,
    savingsByConfidence: {
      high: Math.round(savingsByConfidence.high),
      medium: Math.round(savingsByConfidence.medium),
      low: Math.round(savingsByConfidence.low),
    },
    savingsByCategory,
  };
}

export function calculateSaveScore(
  totalAnnualSpendRon: number,
  contracts: ContractItem[],
  opportunities: SavingsOpportunity[]
): SaveScoreBreakdown {
  // 1. Contract Coverage Factor (Max 25)
  const contractedSpend = (contracts || []).reduce((sum, c) => sum + c.annualValue, 0);
  const coverageRatio = totalAnnualSpendRon > 0 ? Math.min(1, contractedSpend / totalAnnualSpendRon) : 0;
  const contractCoverageScore = Math.round(coverageRatio * 25);

  // 2. Benchmark Competitiveness Factor (Max 35)
  // Higher score if less spend is leaking into inefficient contracts
  const openOpps = (opportunities || []).filter((o) => o.status === 'open');
  const identifiedSavingsMid = openOpps.reduce((sum, o) => sum + (o.estimatedSavingsMin + o.estimatedSavingsMax) / 2, 0);
  const inefficiencyRatio = totalAnnualSpendRon > 0 ? Math.min(0.5, identifiedSavingsMid / totalAnnualSpendRon) : 0;
  const benchmarkCompetitivenessScore = Math.max(5, Math.round(35 - (inefficiencyRatio / 0.5) * 25));

  // 3. Renewal Notice Readiness Factor (Max 20)
  // Penalize contracts with expired notices or in renewal window without action
  const atRiskContracts = (contracts || []).filter((c) => c.status === 'in_renewal_window' || (c.daysUntilNotice !== undefined && c.daysUntilNotice <= 0));
  const totalContractsCount = Math.max(1, contracts.length);
  const noticeHealthRatio = Math.max(0, 1 - (atRiskContracts.length / totalContractsCount));
  const renewalNoticeReadinessScore = Math.round(noticeHealthRatio * 20);

  // 4. Supplier Consolidation & Structure Factor (Max 20)
  const supplierConsolidationScore = 16; // Standard base for well-managed SME vendor count

  const totalScore = Math.min(100, Math.max(0, 
    contractCoverageScore + 
    benchmarkCompetitivenessScore + 
    renewalNoticeReadinessScore + 
    supplierConsolidationScore
  ));

  let grade: SaveScoreBreakdown['grade'] = 'C';
  let headline = 'Eficiență moderată de achiziții. Există spațiu clar de optimizare a costurilor.';

  if (totalScore >= 85) {
    grade = 'A';
    headline = 'Eficiență excelentă de achiziții și contracte bine negociate.';
  } else if (totalScore >= 70) {
    grade = 'B';
    headline = 'Eficiență bună, dar 3 categorii majore necesită renegociere.';
  } else if (totalScore >= 50) {
    grade = 'C';
    headline = 'Eficiență medie. Plătești peste mediana pieței în telecom, curierat și software.';
  } else if (totalScore >= 35) {
    grade = 'D';
    headline = 'Risc ridicat de supracost și reînnoiri automate nesupravegheate.';
  } else {
    grade = 'F';
    headline = 'Achiziții nestructurate. Economii potențiale masive identificate.';
  }

  return {
    totalScore,
    factors: {
      contractCoverage: {
        score: contractCoverageScore,
        max: 25,
        label: 'Acoperire Contractuală',
        details: `${Math.round(coverageRatio * 100)}% din cheltuielile anuale sunt acoperite de contracte active monitorizate.`,
      },
      benchmarkCompetitiveness: {
        score: benchmarkCompetitivenessScore,
        max: 35,
        label: 'Competitivitate Tarife Piață',
        details: `${openOpps.length} oportunități de optimizare identificate comparativ cu benchmark-urile B2B.`,
      },
      renewalNoticeReadiness: {
        score: renewalNoticeReadinessScore,
        max: 20,
        label: 'Control Reînnoiri & Preaviz',
        details: atRiskContracts.length > 0
          ? `${atRiskContracts.length} contracte se află în fereastra critică de notificare preaviz.`
          : 'Toate contractele sunt monitorizate cu termen de preaviz confortabil.',
      },
      supplierConsolidation: {
        score: supplierConsolidationScore,
        max: 20,
        label: 'Structură & Relație Furnizori',
        details: 'Distribuție echilibrată pe categorii fără dependențe critice nelicențiate.',
      },
    },
    grade,
    headline,
  };
}
