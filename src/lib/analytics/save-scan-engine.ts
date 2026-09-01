import { 
  SpendRecord, 
  Supplier, 
  DocumentItem, 
  ContractItem, 
  SavingsOpportunity, 
  SpendCategory 
} from '../types';

export interface SaveScanSignal {
  id: string;
  type: 'supplier_concentration' | 'spend_increase' | 'recurring_spend' | 'dominant_category' | 'unusual_invoice' | 'duplicate_risk' | 'contract_renewal';
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  metricValue?: string;
  category?: SpendCategory;
  supplierId?: string;
  supplierName?: string;
  currentAnnualSpend?: number;
  recommendedAction: string;
}

export interface SaveScanResult {
  signals: SaveScanSignal[];
  opportunities: SavingsOpportunity[];
  topConcentrationSummary?: string;
  analyzedInvoicesCount: number;
  analyzedSuppliersCount: number;
  totalAnalyzedSpendRon: number;
}

/**
 * Deterministic SAVE Scan v1 Engine
 * Analyzes exclusively REAL Romanian invoices, suppliers, and spend records.
 * Never fabricates benchmark savings or fake market prices.
 */
export function runSaveScan(
  organizationId: string,
  spendRecords: SpendRecord[],
  suppliers: Supplier[],
  documents: DocumentItem[],
  contracts: ContractItem[] = []
): SaveScanResult {
  const signals: SaveScanSignal[] = [];
  const opportunities: SavingsOpportunity[] = [];
  const now = new Date().toISOString();

  if (!spendRecords || spendRecords.length === 0) {
    return {
      signals: [],
      opportunities: [],
      analyzedInvoicesCount: 0,
      analyzedSuppliersCount: 0,
      totalAnalyzedSpendRon: 0,
    };
  }

  const totalSpend = spendRecords.reduce((sum, r) => sum + r.amount, 0);
  const nowTime = new Date().getTime();

  // -------------------------------------------------------------
  // A. SUPPLIER CONCENTRATION
  // -------------------------------------------------------------
  const supplierSpendMap: Record<string, { name: string; amount: number; count: number; category: SpendCategory }> = {};
  spendRecords.forEach((r) => {
    if (!supplierSpendMap[r.supplierId]) {
      supplierSpendMap[r.supplierId] = {
        name: r.supplierName,
        amount: 0,
        count: 0,
        category: r.category,
      };
    }
    supplierSpendMap[r.supplierId].amount += r.amount;
    supplierSpendMap[r.supplierId].count += 1;
  });

  const sortedSuppliers = Object.entries(supplierSpendMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.amount - a.amount);

  if (sortedSuppliers.length >= 2 && totalSpend > 0) {
    const top3 = sortedSuppliers.slice(0, 3);
    const top3Spend = top3.reduce((sum, s) => sum + s.amount, 0);
    const top3Percentage = Math.round((top3Spend / totalSpend) * 100);

    if (top3Percentage >= 45) {
      signals.push({
        id: `sig_conc_${organizationId}`,
        type: 'supplier_concentration',
        severity: top3Percentage >= 65 ? 'high' : 'medium',
        title: 'Concentrare Ridicată a Furnizorilor',
        description: `Top ${top3.length} furnizori (${top3.map((s) => s.name).join(', ')}) reprezintă ${top3Percentage}% din totalul cheltuielilor analizate (${Math.round(top3Spend).toLocaleString('ro-RO')} lei).`,
        metricValue: `${top3Percentage}% din OPEX`,
        recommendedAction: 'Cere oferte alternative pentru a reduce dependența comercială și a obține condiții competitive.',
      });
    }
  }

  // -------------------------------------------------------------
  // B. DOMINANT SPEND CATEGORIES
  // -------------------------------------------------------------
  const categorySpendMap: Record<string, number> = {};
  spendRecords.forEach((r) => {
    categorySpendMap[r.category] = (categorySpendMap[r.category] || 0) + r.amount;
  });

  Object.entries(categorySpendMap).forEach(([cat, amount]) => {
    const percentage = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
    if (percentage >= 20) {
      signals.push({
        id: `sig_cat_${cat}_${organizationId}`,
        type: 'dominant_category',
        severity: percentage >= 35 ? 'high' : 'medium',
        title: `Categorie Majoră: ${cat}`,
        description: `Cheltuielile de ${cat} reprezintă ${percentage}% din bugetul analizat (${Math.round(amount).toLocaleString('ro-RO')} lei).`,
        metricValue: `${percentage}% din cheltuieli`,
        category: cat as SpendCategory,
        currentAnnualSpend: Math.round(amount),
        recommendedAction: 'Solicită oferte agregate prin SAVE pentru a obține prețuri negociate de volum (P25).',
      });

      // Also create an optimization candidate opportunity
      opportunities.push({
        id: `opp_cat_${cat}_${organizationId}`,
        organizationId,
        supplierId: `cat_${cat}`,
        supplierName: `Cheltuieli ${cat}`,
        title: `Optimizare Achiziții: ${cat}`,
        category: cat as SpendCategory,
        currentAnnualCost: Math.round(amount),
        estimatedSavingsMin: 0,
        estimatedSavingsMax: 0,
        confidenceLevel: 'medium',
        provenance: 'dataset_source',
        opportunityType: 'optimization_candidate',
        reason: `${cat} reprezintă ${percentage}% din totalul achizițiilor. Agregarea cererii poate reduce costul unitar.`,
        recommendedAction: 'Cere oferte de la furnizori alternativi verificați.',
        status: 'open',
        createdAt: now,
      });
    }
  });

  // -------------------------------------------------------------
  // C. SPEND INCREASES & RECURRING MONTHLY SUPPLIERS
  // -------------------------------------------------------------
  sortedSuppliers.forEach((sup) => {
    const supRecords = spendRecords.filter((r) => r.supplierId === sup.id);

    // Group by month
    const monthlyMap: Record<string, number> = {};
    supRecords.forEach((r) => {
      const m = r.spendDate.substring(0, 7);
      monthlyMap[m] = (monthlyMap[m] || 0) + r.amount;
    });

    const months = Object.keys(monthlyMap).sort();
    if (months.length >= 2) {
      const latestMonth = months[months.length - 1];
      const latestAmount = monthlyMap[latestMonth];
      const prevMonths = months.slice(0, -1);
      const prevAvg = prevMonths.reduce((sum, m) => sum + monthlyMap[m], 0) / prevMonths.length;

      if (prevAvg > 0 && latestAmount > prevAvg * 1.18) {
        const increasePct = Math.round(((latestAmount - prevAvg) / prevAvg) * 100);
        signals.push({
          id: `sig_inc_${sup.id}`,
          type: 'spend_increase',
          severity: increasePct >= 30 ? 'high' : 'medium',
          title: `Creștere Cost Factură: ${sup.name}`,
          description: `Cheltuielile către ${sup.name} au crescut în ${latestMonth} cu ${increasePct}% față de media lunilor anterioare (${Math.round(latestAmount).toLocaleString('ro-RO')} lei vs ~${Math.round(prevAvg).toLocaleString('ro-RO')} lei).`,
          metricValue: `+${increasePct}% creștere`,
          category: sup.category,
          supplierId: sup.id,
          supplierName: sup.name,
          currentAnnualSpend: Math.round(sup.amount),
          recommendedAction: 'Verifică dacă creșterea este justificată de volum sau de indexări tarifare ascunse.',
        });

        opportunities.push({
          id: `opp_inc_${sup.id}`,
          organizationId,
          supplierId: sup.id,
          supplierName: sup.name,
          title: `Cost ${sup.name} în creștere (+${increasePct}%)`,
          category: sup.category,
          currentAnnualCost: Math.round(sup.amount),
          estimatedSavingsMin: 0,
          estimatedSavingsMax: 0,
          confidenceLevel: 'high',
          provenance: 'dataset_source',
          opportunityType: 'optimization_candidate',
          reason: `Factura recentă (${Math.round(latestAmount).toLocaleString('ro-RO')} lei) depășește media istorică cu ${increasePct}%.`,
          recommendedAction: 'Cere oferte comparative pentru renegociere.',
          status: 'open',
          createdAt: now,
        });
      }
    }

    // Recurring supplier signal
    if (supRecords.length >= 2 && sup.amount >= 2000) {
      signals.push({
        id: `sig_rec_${sup.id}`,
        type: 'recurring_spend',
        severity: 'info',
        title: `Furnizor Recurent Activ: ${sup.name}`,
        description: `${sup.name} a emis ${supRecords.length} facturi în valoare totală de ${Math.round(sup.amount).toLocaleString('ro-RO')} lei.`,
        category: sup.category,
        supplierId: sup.id,
        supplierName: sup.name,
        currentAnnualSpend: Math.round(sup.amount),
        recommendedAction: 'Evaluează oportunitatea unui acord comercial cadru pe 12-24 luni cu tarife preferențiale.',
      });
    }
  });

  // -------------------------------------------------------------
  // D. DUPLICATE INVOICE RISK CHECK
  // -------------------------------------------------------------
  const invoiceSeenMap = new Map<string, DocumentItem>();
  documents.forEach((doc) => {
    if (doc.extraction && doc.extraction.invoiceNumber) {
      const key = `${doc.extraction.supplierCui || doc.supplierName}_${doc.extraction.invoiceNumber.toLowerCase().trim()}_${doc.extraction.invoiceDate}`;
      if (invoiceSeenMap.has(key)) {
        const prev = invoiceSeenMap.get(key)!;
        signals.push({
          id: `sig_dup_${doc.id}`,
          type: 'duplicate_risk',
          severity: 'high',
          title: `Risc Factură Duplicată: #${doc.extraction.invoiceNumber}`,
          description: `Au fost detectate două documente cu același număr de factură (${doc.extraction.invoiceNumber}), furnizor (${doc.supplierName}) și dată de emitere.`,
          supplierId: doc.supplierId,
          supplierName: doc.supplierName,
          category: doc.extraction.category,
          recommendedAction: 'Verifică registrul contabil pentru a evita plata dublă.',
        });
      } else {
        invoiceSeenMap.set(key, doc);
      }
    }
  });

  // -------------------------------------------------------------
  // E. CONTRACT RENEWAL WINDOW SIGNALS
  // -------------------------------------------------------------
  contracts.forEach((c) => {
    if (c.expiryDate) {
      const expiry = new Date(c.expiryDate).getTime();
      const daysUntilExpiry = Math.ceil((expiry - nowTime) / (1000 * 60 * 60 * 24));
      const noticeDays = c.noticePeriodDays || 30;

      if (daysUntilExpiry > 0 && daysUntilExpiry <= noticeDays + 15) {
        signals.push({
          id: `sig_ren_${c.id}`,
          type: 'contract_renewal',
          severity: 'high',
          title: `Fereastră Reînnoire Contract: ${c.supplierName}`,
          description: `Contractul „${c.title}” expiră în ${daysUntilExpiry} zile. Termen limită preaviz: ${noticeDays} zile.`,
          supplierId: c.supplierId,
          supplierName: c.supplierName,
          category: c.category,
          recommendedAction: 'Trimite notificare de renegociere înainte de intrarea în vigoare a reînnoirii automate.',
        });

        opportunities.push({
          id: `opp_ren_${c.id}`,
          organizationId,
          supplierId: c.supplierId,
          supplierName: c.supplierName,
          contractId: c.id,
          title: `Reînnoire Iminentă: Contract ${c.supplierName}`,
          category: c.category,
          currentAnnualCost: c.annualValue,
          estimatedSavingsMin: 0,
          estimatedSavingsMax: 0,
          confidenceLevel: 'high',
          provenance: 'dataset_source',
          opportunityType: 'optimization_candidate',
          reason: `Contractul intră în perioada critică de preaviz (${daysUntilExpiry} zile rămase).`,
          recommendedAction: 'Cere oferte concurente pentru a negocia de pe o poziție de forță.',
          status: 'open',
          createdAt: now,
        });
      }
    }
  });

  return {
    signals,
    opportunities,
    analyzedInvoicesCount: documents.length,
    analyzedSuppliersCount: suppliers.length,
    totalAnalyzedSpendRon: Math.round(totalSpend),
  };
}
