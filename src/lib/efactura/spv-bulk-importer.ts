import JSZip from 'jszip';
import { parseEFacturaXml, EFacturaParsedResult } from '../ai/efactura-parser';
import { normalizeCuiString } from '../company-lookup/cui-validator';
import { 
  DocumentItem, 
  SpendRecord, 
  Supplier, 
  Organization, 
  EfacturaImportBatch 
} from '../types';

export interface SpvRawFile {
  name: string;
  data: string | ArrayBuffer | Uint8Array;
}

export interface SpvBulkImportResult {
  batch: EfacturaImportBatch;
  importedDocuments: DocumentItem[];
  newSpendRecords: SpendRecord[];
  updatedSuppliers: Supplier[];
  totalProcessed: number;
  importedCount: number;
  duplicatesCount: number;
  invalidCount: number;
  mismatchedCuiCount: number;
  errors: string[];
}

export class SpvBulkImporter {
  /**
   * Unpacks ZIP files and collects all individual XML string payloads.
   */
  public async extractXmlFiles(
    files: SpvRawFile[],
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<Array<{ fileName: string; xmlContent: string }>> {
    const extractedXmls: Array<{ fileName: string; xmlContent: string }> = [];
    const totalInputFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (onProgress) {
        onProgress(i + 1, totalInputFiles, file.name);
      }

      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file.data);
          const zipEntries = Object.keys(zip.files);

          for (const relativePath of zipEntries) {
            const entry = zip.files[relativePath];
            if (!entry.dir && relativePath.toLowerCase().endsWith('.xml')) {
              const xmlContent = await entry.async('string');
              extractedXmls.push({
                fileName: relativePath.split('/').pop() || relativePath,
                xmlContent,
              });
            }
          }
        } catch (err: any) {
          console.warn(`Could not extract ZIP file ${file.name}:`, err);
        }
      } else if (file.name.toLowerCase().endsWith('.xml')) {
        let xmlContent = '';
        if (typeof file.data === 'string') {
          xmlContent = file.data;
        } else if (file.data instanceof ArrayBuffer || file.data instanceof Uint8Array) {
          const decoder = new TextDecoder('utf-8');
          xmlContent = decoder.decode(file.data);
        }
        if (xmlContent) {
          extractedXmls.push({
            fileName: file.name,
            xmlContent,
          });
        }
      }
    }

    return extractedXmls;
  }

  /**
   * Deterministically processes extracted XML invoices with CUI identity validation,
   * deduplication, supplier matching, and spend creation.
   */
  public processXmlInvoices(
    invoices: Array<{ fileName: string; xmlContent: string }>,
    organization: Organization,
    existingDocs: DocumentItem[] = [],
    existingSuppliers: Supplier[] = [],
    uploaderName: string = 'Utilizator',
    onProgress?: (processed: number, total: number) => void
  ): SpvBulkImportResult {
    const orgCuiClean = normalizeCuiString(organization.cui || '');
    const batchId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `batch_${Date.now()}`;
    const now = new Date().toISOString();

    let importedCount = 0;
    let duplicatesCount = 0;
    let invalidCount = 0;
    let mismatchedCuiCount = 0;
    const errors: string[] = [];

    const importedDocuments: DocumentItem[] = [];
    const newSpendRecords: SpendRecord[] = [];
    const updatedSuppliersMap = new Map<string, Supplier>();

    // Index existing suppliers by normalized CUI
    existingSuppliers.forEach((sup) => {
      const supCuiClean = normalizeCuiString(sup.cui || '');
      if (supCuiClean) {
        updatedSuppliersMap.set(supCuiClean, { ...sup });
      }
    });

    // Existing invoice deduplication index: (supplierCui + invoiceNumber + invoiceDate)
    const existingInvoicesSet = new Set<string>();
    existingDocs.forEach((d) => {
      if (d.extraction) {
        const supCui = normalizeCuiString(d.extraction.supplierCui || d.extraction.supplier || '');
        const invNum = (d.extraction.invoiceNumber || '').trim().toLowerCase();
        const invDate = d.extraction.invoiceDate || '';
        existingInvoicesSet.add(`${supCui}_${invNum}_${invDate}`);
      }
    });

    const total = invoices.length;

    for (let i = 0; i < invoices.length; i++) {
      const item = invoices[i];
      if (onProgress) {
        onProgress(i + 1, total);
      }

      const parsed: EFacturaParsedResult | null = parseEFacturaXml(item.xmlContent);
      if (!parsed) {
        invalidCount++;
        errors.push(`Documentul „${item.fileName}” nu conține o structură UBL XML validă.`);
        continue;
      }

      const buyerCuiClean = normalizeCuiString(parsed.customerCui);
      const sellerCuiClean = normalizeCuiString(parsed.supplierCui);

      // CUI VALIDATION: For received invoices, buyer CUI MUST match organization CUI
      if (orgCuiClean && buyerCuiClean && orgCuiClean !== buyerCuiClean) {
        mismatchedCuiCount++;
        errors.push(
          `Factura #${parsed.invoiceNumber} aparține altei companii (CUI Cumpărător ${buyerCuiClean} ≠ CUI companie ${orgCuiClean}).`
        );
        continue;
      }

      // DEDUPLICATION CHECK
      const invoiceKey = `${sellerCuiClean}_${parsed.invoiceNumber.trim().toLowerCase()}_${parsed.invoiceDate}`;
      if (existingInvoicesSet.has(invoiceKey)) {
        duplicatesCount++;
        continue;
      }

      // Add to set to prevent duplicate entries inside the same batch
      existingInvoicesSet.add(invoiceKey);

      // SUPPLIER MATCHING / CREATION (seller CUI is the supplier)
      const invoiceAmount = parsed.invoiceTotal > 0 ? parsed.invoiceTotal : (parsed.netTotal * 1.19);
      let supplier = updatedSuppliersMap.get(sellerCuiClean);

      if (supplier) {
        supplier.totalAnnualSpendRon += invoiceAmount;
        supplier.invoiceCount = (supplier.invoiceCount || 0) + 1;
      } else {
        const supplierId = `sup_${sellerCuiClean || Date.now()}_${importedCount}`;
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
          createdAt: now,
        };
        if (sellerCuiClean) {
          updatedSuppliersMap.set(sellerCuiClean, supplier);
        }
      }

      // DOCUMENT ITEM CREATION
      const docId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc_spv_${Date.now()}_${importedCount}`;
      const docItem: DocumentItem = {
        id: docId,
        organizationId: organization.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        fileName: item.fileName,
        filePath: `${organization.id}/efactura/${docId}.xml`,
        fileSizeBytes: item.xmlContent.length,
        mimeType: 'application/xml',
        documentType: 'invoice',
        status: 'verified',
        uploadedByName: `Import SPV (${uploaderName})`,
        createdAt: parsed.invoiceDate ? `${parsed.invoiceDate}T10:00:00.000Z` : now,
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
          currency: parsed.currency || 'RON',
          automaticRenewal: false,
          confidence: 100,
          needsReview: false,
          createdAt: now,
        },
      };

      importedDocuments.push(docItem);

      // SPEND RECORD CREATION
      const spendId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `spend_spv_${Date.now()}_${importedCount}`;
      const spendRecord: SpendRecord = {
        id: spendId,
        organizationId: organization.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        documentId: docId,
        category: parsed.category,
        description: `Factură SPV #${parsed.invoiceNumber} (${parsed.supplierName})`,
        amount: parsed.netTotal > 0 ? parsed.netTotal : parsed.invoiceTotal,
        currency: parsed.currency || 'RON',
        spendDate: parsed.invoiceDate || now.split('T')[0],
        isRecurring: true,
        periodType: 'monthly',
        createdAt: now,
      };

      newSpendRecords.push(spendRecord);
      importedCount++;
    }

    const batch: EfacturaImportBatch = {
      id: batchId,
      organizationId: organization.id,
      source: 'spv_manual',
      totalFiles: invoices.length,
      totalProcessed: invoices.length,
      importedCount,
      duplicatesCount,
      invalidCount,
      mismatchedCuiCount,
      uploadedBy: uploaderName,
      createdAt: now,
    };

    return {
      batch,
      importedDocuments,
      newSpendRecords,
      updatedSuppliers: Array.from(updatedSuppliersMap.values()),
      totalProcessed: invoices.length,
      importedCount,
      duplicatesCount,
      invalidCount,
      mismatchedCuiCount,
      errors,
    };
  }
}

export const spvBulkImporter = new SpvBulkImporter();
