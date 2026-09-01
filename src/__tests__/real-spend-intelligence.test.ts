import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { SpvBulkImporter } from '@/lib/efactura/spv-bulk-importer';
import { runSaveScan } from '@/lib/analytics/save-scan-engine';
import { calculateSpendSummary } from '@/lib/analytics/spend-calculator';
import { Organization, SpendRecord, Supplier, DocumentItem } from '@/lib/types';

describe('REAL Spend Intelligence Pipeline End-to-End Test', () => {
  const targetOrg: Organization = {
    id: 'org_real_beta_srl',
    name: 'Beta Distribution & Tech SRL',
    cui: 'RO14399840',
    industry: 'Comerț & Distribuție',
    employeeRange: '20-49',
    monthlyOpexRon: 75000,
    saveScore: 78,
    isDemo: false,
    currency: 'RON',
    createdAt: '2026-01-01T00:00:00Z',
    verificationStatus: 'verified',
    vatRegistered: true,
  };

  const xmlVodafoneAugust = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-2026-08</cbc:ID>
  <cbc:IssueDate>2026-08-15</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Vodafone România SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>8970105</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Beta Distribution &amp; Tech SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">4000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">4760.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">4760.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>20</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">4000.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Abonament Date Mobile 5G &amp; Voce</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">200.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  const xmlVodafoneJuly = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-2026-07</cbc:ID>
  <cbc:IssueDate>2026-07-15</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Vodafone România SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>8970105</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Beta Distribution &amp; Tech SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">3000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">3570.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">3570.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>20</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">3000.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Abonament Date Mobile 5G &amp; Voce</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">150.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  const xmlFanCourier = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>FAN-99201</cbc:ID>
  <cbc:IssueDate>2026-08-20</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Fan Courier Express SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>13838336</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Beta Distribution &amp; Tech SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">8500.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">10115.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">10115.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>600</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">8500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Servicii Curierat &amp; Expediere Colete Standard</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">14.16</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  const xmlMismatchedCui = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>ALT-001</cbc:ID>
  <cbc:IssueDate>2026-08-10</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Furnizor Oarecare SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>9999999</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Companie Diferită SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>55555555</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">5000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">5950.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">5950.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;

  it('1. Imports real SPV archive with deterministic UBL extraction and supplier reuse', async () => {
    const importer = new SpvBulkImporter();
    const zip = new JSZip();
    zip.file('Factura_VDF_Aug.xml', xmlVodafoneAugust);
    zip.file('Factura_VDF_Iul.xml', xmlVodafoneJuly);
    zip.file('Factura_FAN.xml', xmlFanCourier);
    zip.file('Factura_AltCui.xml', xmlMismatchedCui);

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    const rawFiles = [{ name: 'SPV_Download_Aug_2026.zip', data: zipBuffer }];

    const extractedFiles = await importer.extractXmlFiles(rawFiles);
    expect(extractedFiles.length).toBe(4);

    const result = importer.processXmlInvoices(extractedFiles, targetOrg, [], [], 'Admin');

    // Mismatched CUI must be rejected
    expect(result.importedCount).toBe(3);
    expect(result.mismatchedCuiCount).toBe(1);
    expect(result.duplicatesCount).toBe(0);

    // Suppliers created & reused
    expect(result.updatedSuppliers.length).toBe(2); // Vodafone and Fan Courier
    const vdfSupplier = result.updatedSuppliers.find((s) => s.name === 'Vodafone România SA')!;
    expect(vdfSupplier.invoiceCount).toBe(2);
    expect(vdfSupplier.totalAnnualSpendRon).toBe(4760 + 3570);

    const fanSupplier = result.updatedSuppliers.find((s) => s.name === 'Fan Courier Express SRL')!;
    expect(fanSupplier.invoiceCount).toBe(1);
    expect(fanSupplier.totalAnnualSpendRon).toBe(10115);
  });

  it('2. Verifies financial calculation accuracy (XML totals match SAVE spend records)', () => {
    const importer = new SpvBulkImporter();
    const invoices = [
      { fileName: 'VDF_Aug.xml', xmlContent: xmlVodafoneAugust },
      { fileName: 'FAN.xml', xmlContent: xmlFanCourier },
    ];
    const result = importer.processXmlInvoices(invoices, targetOrg, [], [], 'Admin');

    const totalSpend = result.newSpendRecords.reduce((sum, r) => sum + r.amount, 0);
    expect(totalSpend).toBe(4000 + 8500); // 12,500.00 RON Net (Tax Exclusive)

    const summary = calculateSpendSummary(result.newSpendRecords);
    expect(summary.totalAnnualSpendRon).toBe(150000); // 12,500 * 12
    expect(summary.categoryBreakdown.Telecom.amount).toBe(48000); // 4,000 * 12
    expect(summary.categoryBreakdown.Curierat.amount).toBe(102000); // 8,500 * 12
  });

  it('3. Runs SAVE Scan v1 to detect price increases and supplier concentration deterministically', () => {
    const importer = new SpvBulkImporter();
    const invoices = [
      { fileName: 'VDF_Aug.xml', xmlContent: xmlVodafoneAugust }, // 4000 in Aug
      { fileName: 'VDF_Iul.xml', xmlContent: xmlVodafoneJuly },   // 3000 in Jul (+33% increase)
      { fileName: 'FAN.xml', xmlContent: xmlFanCourier },          // 8500 in Aug (dominant category & concentration)
    ];
    const importResult = importer.processXmlInvoices(invoices, targetOrg, [], [], 'Admin');

    const scanResult = runSaveScan(
      targetOrg.id,
      importResult.newSpendRecords,
      importResult.updatedSuppliers,
      importResult.importedDocuments
    );

    expect(scanResult.signals.length).toBeGreaterThanOrEqual(2);

    // Check for Spend Increase signal
    const increaseSignal = scanResult.signals.find((s) => s.type === 'spend_increase');
    expect(increaseSignal).toBeDefined();
    expect(increaseSignal?.supplierName).toBe('Vodafone România SA');
    expect(increaseSignal?.title).toContain('Creștere Cost Factură');

    // Check for Dominant Category signal (Curierat is > 50% of total spend)
    const categorySignal = scanResult.signals.find((s) => s.type === 'dominant_category' && s.category === 'Curierat');
    expect(categorySignal).toBeDefined();
    expect(categorySignal?.category).toBe('Curierat');

    // Check generated opportunities
    expect(scanResult.opportunities.length).toBeGreaterThanOrEqual(1);
    expect(scanResult.opportunities[0].opportunityType).toBe('optimization_candidate');
  });

  it('4. Prevents duplicate spend on second import run (Idempotency)', () => {
    const importer = new SpvBulkImporter();
    const invoices = [{ fileName: 'VDF_Aug.xml', xmlContent: xmlVodafoneAugust }];
    
    // First run
    const run1 = importer.processXmlInvoices(invoices, targetOrg, [], [], 'Admin');
    expect(run1.importedCount).toBe(1);

    // Second run with existing documents
    const run2 = importer.processXmlInvoices(
      invoices,
      targetOrg,
      run1.importedDocuments,
      run1.updatedSuppliers,
      'Admin'
    );
    expect(run2.importedCount).toBe(0);
    expect(run2.duplicatesCount).toBe(1);
    expect(run2.newSpendRecords.length).toBe(0);
  });
});
