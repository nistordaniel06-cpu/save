import { parseEFacturaXml, EFacturaParsedResult } from '../ai/efactura-parser';
import { normalizeCuiString } from '../company-lookup/cui-validator';
import { 
  DocumentItem, 
  SpendRecord, 
  Supplier, 
  EfacturaSyncRun, 
  SpendCategory,
  Organization 
} from '../types';
import { EfacturaRawMessage, EfacturaSyncOptions, EfacturaSyncResult } from './types';

export class EfacturaSyncEngine {
  /**
   * Ingests a list of raw ANAF e-Factura messages/invoices into the organization.
   * Enforces strict buyer CUI validation, deterministic UBL parsing, deduplication, and supplier/spend creation.
   */
  public processMessages(
    messages: EfacturaRawMessage[],
    organization: Organization,
    existingDocs: DocumentItem[] = [],
    existingSuppliers: Supplier[] = [],
    existingSpend: SpendRecord[] = []
  ): {
    result: EfacturaSyncResult;
    newDocuments: DocumentItem[];
    newSpendRecords: SpendRecord[];
    updatedSuppliers: Supplier[];
  } {
    const orgCuiClean = normalizeCuiString(organization.cui || '');
    const syncRunId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sync_${Date.now()}`;
    const startedAt = new Date().toISOString();

    let invoicesReceived = 0;
    let invoicesSent = 0;
    let invoicesImported = 0;
    let duplicatesSkipped = 0;
    let mismatchedCuiCount = 0;
    const errors: string[] = [];

    const newDocuments: DocumentItem[] = [];
    const newSpendRecords: SpendRecord[] = [];
    const updatedSuppliersMap = new Map<string, Supplier>();

    // Index existing suppliers by normalized CUI
    existingSuppliers.forEach((sup) => {
      const supCuiClean = normalizeCuiString(sup.cui || '');
      if (supCuiClean) {
        updatedSuppliersMap.set(supCuiClean, { ...sup });
      }
    });

    // Existing invoice deduplication lookup: (supplierCui + invoiceNumber + invoiceDate)
    const existingInvoicesSet = new Set<string>();
    existingDocs.forEach((d) => {
      if (d.extraction) {
        const supCui = normalizeCuiString(d.extraction.supplierCui || '');
        const invNum = (d.extraction.invoiceNumber || '').trim().toLowerCase();
        const invDate = d.extraction.invoiceDate || '';
        existingInvoicesSet.add(`${supCui}_${invNum}_${invDate}`);
      }
    });

    for (const msg of messages) {
      if (msg.tip === 'FACTURA TRIMISA') {
        invoicesSent++;
        continue;
      }

      invoicesReceived++;

      if (!msg.xmlContent) {
        errors.push(`Mesajul ${msg.id} nu conține conținut XML descărcat.`);
        continue;
      }

      const parsed: EFacturaParsedResult | null = parseEFacturaXml(msg.xmlContent);
      if (!parsed) {
        errors.push(`Eroare la parsarea XML UBL pentru mesajul ${msg.id}.`);
        continue;
      }

      const buyerCuiClean = normalizeCuiString(parsed.customerCui);
      const sellerCuiClean = normalizeCuiString(parsed.supplierCui);

      // PART 7 — IDENTITY VERIFICATION: Buyer CUI MUST match organization CUI for received invoices
      if (orgCuiClean && buyerCuiClean && orgCuiClean !== buyerCuiClean) {
        mismatchedCuiCount++;
        errors.push(
          `Factura #${parsed.invoiceNumber} respinsă: CUI Cumpărător (${buyerCuiClean}) nu corespunde companiei conectate (${orgCuiClean}).`
        );
        continue;
      }

      // PART 9 — DEDUPLICATION CHECK
      const invoiceKey = `${sellerCuiClean}_${parsed.invoiceNumber.trim().toLowerCase()}_${parsed.invoiceDate}`;
      if (existingInvoicesSet.has(invoiceKey)) {
        duplicatesSkipped++;
        continue;
      }

      // Register into set to prevent intra-batch duplicates
      existingInvoicesSet.add(invoiceKey);

      // PART 10 — AUTOMATIC SUPPLIER CREATION OR REUSE
      let supplier = updatedSuppliersMap.get(sellerCuiClean);
      const invoiceAmount = parsed.invoiceTotal || (parsed.netTotal * 1.19);

      if (supplier) {
        supplier.totalAnnualSpendRon += invoiceAmount;
        supplier.invoiceCount = (supplier.invoiceCount || 0) + 1;
      } else {
        const supplierId = `sup_${sellerCuiClean || Date.now()}`;
        supplier = {
          id: supplierId,
          organizationId: organization.id,
          name: parsed.supplierName,
          cui: sellerCuiClean ? `RO${sellerCuiClean}` : undefined,
          category: parsed.category,
          rating: 4.8,
          isPreferred: false,
          totalAnnualSpendRon: invoiceAmount,
          contractCount: 0,
          invoiceCount: 1,
          createdAt: new Date().toISOString(),
        };
        if (sellerCuiClean) {
          updatedSuppliersMap.set(sellerCuiClean, supplier);
        }
      }

      // PART 8 — DOCUMENT & EXTRACTION RECORD
      const docId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc_efactura_${Date.now()}_${invoicesImported}`;
      const docItem: DocumentItem = {
        id: docId,
        organizationId: organization.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        fileName: `Factura_eFactura_${parsed.invoiceNumber}_${sellerCuiClean || 'RO'}.xml`,
        filePath: `${organization.id}/efactura/${docId}.xml`,
        fileSizeBytes: msg.xmlContent.length,
        mimeType: 'application/xml',
        documentType: 'invoice',
        status: 'verified',
        uploadedByName: 'Sincronizare RO e-Factura',
        createdAt: parsed.invoiceDate ? `${parsed.invoiceDate}T10:00:00.000Z` : new Date().toISOString(),
        extraction: {
          id: `ext_${docId}`,
          documentId: docId,
          organizationId: organization.id,
          supplier: parsed.supplierName,
          supplierName: parsed.supplierName,
          supplierCui: parsed.supplierCui,
          customerName: parsed.customerName,
          customerCui: parsed.customerCui,
          documentType: 'invoice',
          category: parsed.category,
          invoiceNumber: parsed.invoiceNumber,
          invoiceDate: parsed.invoiceDate,
          dueDate: parsed.dueDate || undefined,
          invoiceTotal: parsed.invoiceTotal,
          currency: parsed.currency,
          automaticRenewal: false,
          confidence: 100,
          needsReview: false,
          createdAt: new Date().toISOString(),
        },
      };

      newDocuments.push(docItem);

      // PART 11 — AUTOMATIC SPEND RECORD CREATION
      const spendId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `spend_${Date.now()}_${invoicesImported}`;
      const spendRecord: SpendRecord = {
        id: spendId,
        organizationId: organization.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        documentId: docId,
        category: parsed.category,
        description: `Factură e-Factura #${parsed.invoiceNumber} (${parsed.supplierName})`,
        amount: parsed.netTotal > 0 ? parsed.netTotal : parsed.invoiceTotal,
        currency: parsed.currency || 'RON',
        spendDate: parsed.invoiceDate || new Date().toISOString().split('T')[0],
        isRecurring: true,
        periodType: 'monthly',
        createdAt: new Date().toISOString(),
      };

      newSpendRecords.push(spendRecord);
      invoicesImported++;
    }

    const completedAt = new Date().toISOString();
    const syncRun: EfacturaSyncRun = {
      id: syncRunId,
      organizationId: organization.id,
      status: errors.length > 0 && invoicesImported === 0 ? 'failed' : 'completed',
      startedAt,
      completedAt,
      invoicesReceived,
      invoicesSent,
      invoicesImported,
      duplicatesSkipped,
      errorsCount: errors.length,
      errorDetails: errors.length > 0 ? errors.slice(0, 5).join(' | ') : undefined,
    };

    return {
      result: {
        success: syncRun.status === 'completed',
        syncRun,
        importedInvoices: newDocuments.map((d) => ({
          documentId: d.id,
          invoiceNumber: d.extraction?.invoiceNumber || '',
          supplierName: d.supplierName || '',
          supplierCui: d.extraction?.supplierCui || '',
          amount: d.extraction?.invoiceTotal || 0,
          currency: d.extraction?.currency || 'RON',
          category: d.extraction?.category || 'Servicii',
        })),
        duplicatesSkipped,
        mismatchedCuiCount,
        errors,
      },
      newDocuments,
      newSpendRecords,
      updatedSuppliers: Array.from(updatedSuppliersMap.values()),
    };
  }
}

export const efacturaSyncEngine = new EfacturaSyncEngine();
