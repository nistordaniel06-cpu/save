import { 
  ContractItem, 
  DocumentItem, 
  DocumentExtraction, 
  SpendRecord, 
  VerifiedDemand, 
  SpendCategory 
} from '../types';

export interface DetectionInput {
  organizationId: string;
  organizationName?: string;
  contracts?: ContractItem[];
  extractions?: DocumentExtraction[];
  documents?: DocumentItem[];
  spendRecords?: SpendRecord[];
}

/**
 * MVP Supported categories for Demand Pools
 */
export const MVP_DEMAND_CATEGORIES: SpendCategory[] = ['Telecom', 'Curierat', 'Software'];

/**
 * Deterministically maps category to appropriate commercial unit & service type
 */
export function inferUnitAndService(category: SpendCategory, supplierName: string, notes?: string): {
  unit: string;
  serviceType: string;
  defaultVolume: number;
} {
  const text = `${supplierName} ${notes || ''}`.toLowerCase();

  switch (category) {
    case 'Telecom':
      if (text.includes('fix') || text.includes('sip') || text.includes('fibra')) {
        return { unit: 'line', serviceType: 'Linii Telecomunicații Fix / Date', defaultVolume: 3 };
      }
      return { unit: 'SIM', serviceType: 'Flotă SIM Voce & Date Mobile', defaultVolume: 12 };

    case 'Curierat':
      return { unit: 'parcel', serviceType: 'Expedieri Colete Național Standard', defaultVolume: 150 };

    case 'Software':
      if (text.includes('erp') || text.includes('contabilitate') || text.includes('crm')) {
        return { unit: 'license', serviceType: 'Licențe ERP & Soluții Gestiune', defaultVolume: 5 };
      }
      return { unit: 'seat', serviceType: 'Abonamente Software & Licențe Utilizator', defaultVolume: 10 };

    case 'Energie':
      return { unit: 'MWh', serviceType: 'Furnizare Energie Electrică IMM', defaultVolume: 25 };

    case 'Consumabile':
      return { unit: 'order', serviceType: 'Aprovizionare Recurentă Birotică & Ambalaje', defaultVolume: 4 };

    default:
      return { unit: 'service', serviceType: 'Servicii Generale IMM', defaultVolume: 1 };
  }
}

/**
 * Detects Verified Demands from existing contracts and recurring invoices
 */
export function detectVerifiedDemands(input: DetectionInput): VerifiedDemand[] {
  const { organizationId, organizationName, contracts = [], spendRecords = [] } = input;
  const demands: VerifiedDemand[] = [];
  const processedSuppliers = new Set<string>();

  // 1. Process from Contracts (Highest confidence)
  for (const contract of contracts) {
    const supplierKey = contract.supplierName.toLowerCase().trim();
    processedSuppliers.add(supplierKey);

    const { unit, serviceType, defaultVolume } = inferUnitAndService(
      contract.category,
      contract.supplierName,
      contract.title
    );

    const monthlyCost = Math.round(contract.annualValue / 12);
    const volume = defaultVolume;
    const unitPrice = volume > 0 ? Number((monthlyCost / volume).toFixed(2)) : undefined;

    // Notice deadline calculation
    let noticeDeadline = contract.noticeDeadline || contract.expiryDate;
    if (contract.expiryDate && contract.noticePeriodDays) {
      const endD = new Date(contract.expiryDate);
      endD.setDate(endD.getDate() - contract.noticePeriodDays);
      noticeDeadline = endD.toISOString().split('T')[0];
    }

    const isMvp = MVP_DEMAND_CATEGORIES.includes(contract.category);
    const confidence = isMvp ? 90 : 75;

    demands.push({
      id: `vd_ctr_${contract.id}`,
      organizationId,
      organizationName,
      sourceContractId: contract.id,
      category: contract.category,
      serviceType,
      incumbentSupplierId: contract.supplierId,
      incumbentSupplierName: contract.supplierName,
      currentMonthlyCost: monthlyCost,
      currentAnnualCost: contract.annualValue,
      volume,
      unit,
      currentUnitPrice: unitPrice,
      contractEndDate: contract.expiryDate,
      noticeDeadline,
      eligibleFrom: new Date().toISOString().split('T')[0],
      confidenceScore: confidence,
      status: isMvp ? 'pool_eligible' : 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 2. Process from Recurring Spend (if no existing contract was found for supplier)
  const spendBySupplier: Record<string, { total: number; count: number; category: SpendCategory; lastDocId?: string; name: string }> = {};
  for (const spend of spendRecords) {
    const key = spend.supplierName.toLowerCase().trim();
    if (processedSuppliers.has(key)) continue;

    if (!spendBySupplier[key]) {
      spendBySupplier[key] = {
        total: 0,
        count: 0,
        category: spend.category,
        lastDocId: spend.documentId,
        name: spend.supplierName,
      };
    }
    spendBySupplier[key].total += spend.amount;
    spendBySupplier[key].count += 1;
  }

  for (const [key, agg] of Object.entries(spendBySupplier)) {
    if (agg.total <= 0) continue;

    const estimatedAnnual = agg.count >= 6 ? agg.total * 2 : agg.total * 12;
    const monthlyCost = Math.round(estimatedAnnual / 12);
    const { unit, serviceType, defaultVolume } = inferUnitAndService(agg.category, agg.name);
    const isMvp = MVP_DEMAND_CATEGORIES.includes(agg.category);

    demands.push({
      id: `vd_sp_${key.replace(/[^a-z0-9]/g, '')}`,
      organizationId,
      organizationName,
      sourceDocumentId: agg.lastDocId,
      category: agg.category,
      serviceType,
      incumbentSupplierName: agg.name,
      currentMonthlyCost: monthlyCost,
      currentAnnualCost: estimatedAnnual,
      volume: defaultVolume,
      unit,
      currentUnitPrice: Number((monthlyCost / defaultVolume).toFixed(2)),
      confidenceScore: 70,
      status: isMvp ? 'pool_eligible' : 'detected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return demands;
}
