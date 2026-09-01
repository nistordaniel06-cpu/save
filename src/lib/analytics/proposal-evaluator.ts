import { SpendCategory } from '../types';

export interface MarketBenchmarkItem {
  category: SpendCategory;
  serviceTier: string;
  unitMetric: string;
  p25Price: number;
  p50MedianPrice: number;
  p75Price: number;
  currency: string;
  sampleSize: number;
}

export const ROMANIAN_MARKET_BENCHMARKS: Partial<Record<SpendCategory, MarketBenchmarkItem>> = {
  Telecom: {
    category: 'Telecom',
    serviceTier: 'Voce & Date Nelimitat 5G Business',
    unitMetric: 'lei/abonament/luna',
    p25Price: 38.00,
    p50MedianPrice: 48.50,
    p75Price: 65.00,
    currency: 'RON',
    sampleSize: 140,
  },
  Curierat: {
    category: 'Curierat',
    serviceTier: 'Expediere Standard Nationala Colet <= 1kg',
    unitMetric: 'lei/expediere',
    p25Price: 9.80,
    p50MedianPrice: 11.80,
    p75Price: 14.50,
    currency: 'RON',
    sampleSize: 95,
  },
  Software: {
    category: 'Software',
    serviceTier: 'Productivitate Cloud & Licenta Business',
    unitMetric: 'lei/utilizator/luna',
    p25Price: 52.00,
    p50MedianPrice: 65.00,
    p75Price: 84.00,
    currency: 'RON',
    sampleSize: 110,
  },
  Consumabile: {
    category: 'Consumabile',
    serviceTier: 'Pachet Birotica & Papetarie Birou',
    unitMetric: 'lei/angajat/luna',
    p25Price: 35.00,
    p50MedianPrice: 45.00,
    p75Price: 60.00,
    currency: 'RON',
    sampleSize: 75,
  },
  Energie: {
    category: 'Energie',
    serviceTier: 'Furnizare Energie Electrica Non-Casnic JT',
    unitMetric: 'lei/MWh activ',
    p25Price: 580.00,
    p50MedianPrice: 660.00,
    p75Price: 790.00,
    currency: 'RON',
    sampleSize: 60,
  },
  Servicii: {
    category: 'Servicii',
    serviceTier: 'Servicii Contabilitate, Juridic si Salarizare',
    unitMetric: 'lei/luna',
    p25Price: 800.00,
    p50MedianPrice: 1200.00,
    p75Price: 1800.00,
    currency: 'RON',
    sampleSize: 120,
  },
  Altele: {
    category: 'Altele',
    serviceTier: 'Servicii Generale',
    unitMetric: 'lei/luna',
    p25Price: 500.00,
    p50MedianPrice: 1000.00,
    p75Price: 1500.00,
    currency: 'RON',
    sampleSize: 50,
  },
};

export interface ProposalEvaluationInput {
  supplierName: string;
  category: SpendCategory;
  proposedAnnualCost: number;
  unitPrice?: number | null;
  quantity?: number | null;
  contractDurationMonths?: number;
  automaticRenewal?: boolean;
  priceIndexation?: boolean;
}

export interface ProposalEvaluationResult {
  supplierName: string;
  category: SpendCategory;
  verdict: 'excellent' | 'competitive' | 'overpriced';
  verdictLabel: string;
  proposedAnnualCost: number;
  targetAnnualCost: number;
  potentialAnnualSavings: number;
  savingsPercentage: number;
  benchmark: MarketBenchmarkItem;
  priceVarianceFromMedianPercent: number;
  recommendations: string[];
  counterOfferStrategy: {
    recommendedPrice: number;
    recommendedUnitMetric: string;
    keyArguments: string[];
    contractClausesToEliminate: string[];
  };
}

export function getBenchmarkForCategory(category: SpendCategory): MarketBenchmarkItem {
  return ROMANIAN_MARKET_BENCHMARKS[category] || ROMANIAN_MARKET_BENCHMARKS.Altele || {
    category: 'Altele',
    serviceTier: 'Servicii Generale',
    unitMetric: 'lei/luna',
    p25Price: 500.00,
    p50MedianPrice: 1000.00,
    p75Price: 1500.00,
    currency: 'RON',
    sampleSize: 50,
  };
}

export function evaluateSupplierProposal(input: ProposalEvaluationInput): ProposalEvaluationResult {
  const benchmark = getBenchmarkForCategory(input.category);
  const annualCost = input.proposedAnnualCost;

  let unitPrice = input.unitPrice;
  const quantity = input.quantity || 1;

  if (!unitPrice && annualCost > 0) {
    unitPrice = annualCost / 12 / quantity;
  }

  const currentUnit = unitPrice || benchmark.p50MedianPrice;
  const varianceFromMedian = Number((((currentUnit - benchmark.p50MedianPrice) / benchmark.p50MedianPrice) * 100).toFixed(1));

  let verdict: 'excellent' | 'competitive' | 'overpriced' = 'competitive';
  let verdictLabel = 'Ofertă Competitivă (La nivelul pieței)';
  let targetCost = annualCost;
  let potentialSavings = 0;

  if (currentUnit <= benchmark.p25Price) {
    verdict = 'excellent';
    verdictLabel = 'Ofertă Excelentă (Top 25% piață)';
    targetCost = annualCost;
    potentialSavings = 0;
  } else if (currentUnit > benchmark.p75Price || varianceFromMedian > 15) {
    verdict = 'overpriced';
    verdictLabel = 'Ofertă Supraevaluată (Peste media pieței RO)';
    const targetUnitPrice = (benchmark.p25Price + benchmark.p50MedianPrice) / 2;
    targetCost = Math.round(targetUnitPrice * quantity * 12);
    potentialSavings = Math.max(0, annualCost - targetCost);
  } else {
    verdict = 'competitive';
    verdictLabel = 'Ofertă Moderată (Marjă mică de negociere)';
    targetCost = Math.round(benchmark.p25Price * quantity * 12);
    potentialSavings = Math.max(0, Math.round(annualCost * 0.08));
  }

  const savingsPercentage = annualCost > 0 ? Number(((potentialSavings / annualCost) * 100).toFixed(1)) : 0;

  const recommendations: string[] = [];
  const keyArguments: string[] = [];
  const contractClausesToEliminate: string[] = [];

  if (verdict === 'overpriced') {
    recommendations.push(`Prețul solicitat este cu ${Math.abs(varianceFromMedian)}% peste mediana pieței din România.`);
    recommendations.push(`Solicită ajustarea tarifului la ținta recomandată de ${benchmark.p50MedianPrice} ${benchmark.unitMetric}.`);
    keyArguments.push(`Volumul contractual prognozat justifică încadrarea în nivelul de discount P25-P50 din piață.`);
    keyArguments.push(`Comparația cu ofertele alternative din categoria ${input.category} arată o diferență de peste 15%.`);
  } else if (verdict === 'competitive') {
    recommendations.push(`Oferta este rezonabilă, dar poți obține un discount suplimentar de 5-10% pentru plată la 15 zile sau contract pe 24 luni.`);
    keyArguments.push(`Fidelitatea și predictibilitatea plăților la timp.`);
  } else {
    recommendations.push(`Tariful este excelent. Asigură-te doar că termenul de plată și clauzele de calitate (SLA) sunt favorabile.`);
  }

  if (input.automaticRenewal) {
    recommendations.push(`Atenție la clauza de reînnoire tacită automată: solicită eliminarea sau mărirea ferestrei de preaviz la 60 zile.`);
    contractClausesToEliminate.push(`Prelungirea automată tacită fără acordul scris expres al părților.`);
  }

  if (input.priceIndexation) {
    recommendations.push(`Clauza de indexare automată cu inflația trebuie plafonată la maxim 3-4% anual.`);
    contractClausesToEliminate.push(`Indexarea unilaterală automată a prețului fără drept de reziliere.`);
  }

  return {
    supplierName: input.supplierName,
    category: input.category,
    verdict,
    verdictLabel,
    proposedAnnualCost: annualCost,
    targetAnnualCost: targetCost,
    potentialAnnualSavings: potentialSavings,
    savingsPercentage,
    benchmark,
    priceVarianceFromMedianPercent: varianceFromMedian,
    recommendations,
    counterOfferStrategy: {
      recommendedPrice: benchmark.p50MedianPrice,
      recommendedUnitMetric: benchmark.unitMetric,
      keyArguments,
      contractClausesToEliminate,
    },
  };
}
