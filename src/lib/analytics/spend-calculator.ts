import { SpendRecord, SpendCategory } from '../types';

export interface SpendSummary {
  totalAnnualSpendRon: number;
  monthlyRunRateRon: number;
  recurringSpendRon: number;
  variableSpendRon: number;
  recurringPercentage: number;
  categoryBreakdown: Record<SpendCategory, { amount: number; percentage: number; count: number }>;
  supplierBreakdown: Array<{ supplierName: string; category: SpendCategory; annualSpend: number; percentage: number }>;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

export function calculateSpendSummary(records: SpendRecord[]): SpendSummary {
  if (!records || records.length === 0) {
    return {
      totalAnnualSpendRon: 0,
      monthlyRunRateRon: 0,
      recurringSpendRon: 0,
      variableSpendRon: 0,
      recurringPercentage: 0,
      categoryBreakdown: {
        Telecom: { amount: 0, percentage: 0, count: 0 },
        Software: { amount: 0, percentage: 0, count: 0 },
        Curierat: { amount: 0, percentage: 0, count: 0 },
        Consumabile: { amount: 0, percentage: 0, count: 0 },
        Energie: { amount: 0, percentage: 0, count: 0 },
        Servicii: { amount: 0, percentage: 0, count: 0 },
        Altele: { amount: 0, percentage: 0, count: 0 },
      },
      supplierBreakdown: [],
      monthlyTrend: [],
    };
  }

  // Calculate monthly average per supplier and annualize
  const supplierMonthlyMap: Record<string, { name: string; category: SpendCategory; monthlyTotal: number; count: number }> = {};
  const categoryTotals: Record<SpendCategory, { amount: number; count: number }> = {
    Telecom: { amount: 0, count: 0 },
    Software: { amount: 0, count: 0 },
    Curierat: { amount: 0, count: 0 },
    Consumabile: { amount: 0, count: 0 },
    Energie: { amount: 0, count: 0 },
    Servicii: { amount: 0, count: 0 },
    Altele: { amount: 0, count: 0 },
  };

  const monthlyTotals: Record<string, number> = {};
  let totalRecurringMonthly = 0;
  let totalVariableMonthly = 0;

  records.forEach((record) => {
    // Supplier aggregation
    if (!supplierMonthlyMap[record.supplierId]) {
      supplierMonthlyMap[record.supplierId] = {
        name: record.supplierName,
        category: record.category,
        monthlyTotal: 0,
        count: 0,
      };
    }
    supplierMonthlyMap[record.supplierId].monthlyTotal += record.amount;
    supplierMonthlyMap[record.supplierId].count += 1;

    // Category aggregation
    if (!categoryTotals[record.category]) {
      categoryTotals[record.category] = { amount: 0, count: 0 };
    }
    categoryTotals[record.category].amount += record.amount;
    categoryTotals[record.category].count += 1;

    // Monthly trend aggregation
    const monthKey = record.spendDate.substring(0, 7); // YYYY-MM
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + record.amount;

    // Recurring vs Variable
    if (record.isRecurring) {
      totalRecurringMonthly += record.amount;
    } else {
      totalVariableMonthly += record.amount;
    }
  });

  // Calculate annual run-rates based on distinct monthly periods represented
  const distinctMonths = Object.keys(monthlyTotals).length || 1;
  const avgMonthlySpend = Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / distinctMonths;
  const totalAnnualSpendRon = Math.round(avgMonthlySpend * 12);

  const recurringSpendRon = Math.round((totalRecurringMonthly / distinctMonths) * 12);
  const variableSpendRon = Math.max(0, totalAnnualSpendRon - recurringSpendRon);
  const recurringPercentage = totalAnnualSpendRon > 0 ? Math.round((recurringSpendRon / totalAnnualSpendRon) * 100) : 0;

  // Compute category percentages
  const totalCategorySum = Object.values(categoryTotals).reduce((sum, item) => sum + item.amount, 0);
  const categoryBreakdown: SpendSummary['categoryBreakdown'] = {} as SpendSummary['categoryBreakdown'];

  (Object.keys(categoryTotals) as SpendCategory[]).forEach((cat) => {
    const catData = categoryTotals[cat];
    const annualizedAmount = totalCategorySum > 0 
      ? Math.round((catData.amount / totalCategorySum) * totalAnnualSpendRon)
      : 0;
    categoryBreakdown[cat] = {
      amount: annualizedAmount,
      percentage: totalCategorySum > 0 ? Math.round((catData.amount / totalCategorySum) * 100) : 0,
      count: catData.count,
    };
  });

  // Compute supplier breakdown
  const supplierBreakdown = Object.values(supplierMonthlyMap).map((sup) => {
    const supAnnualSpend = Math.round((sup.monthlyTotal / distinctMonths) * 12);
    const percentage = totalAnnualSpendRon > 0 ? Math.round((supAnnualSpend / totalAnnualSpendRon) * 100) : 0;
    return {
      supplierName: sup.name,
      category: sup.category,
      annualSpend: supAnnualSpend,
      percentage,
    };
  }).sort((a, b) => b.annualSpend - a.annualSpend);

  // Compute monthly trend sorted
  const monthlyTrend = Object.entries(monthlyTotals)
    .map(([month, amount]) => ({ month, amount: Math.round(amount) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalAnnualSpendRon,
    monthlyRunRateRon: Math.round(avgMonthlySpend),
    recurringSpendRon,
    variableSpendRon,
    recurringPercentage,
    categoryBreakdown,
    supplierBreakdown,
    monthlyTrend,
  };
}
