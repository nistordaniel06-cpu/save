import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { SpvBulkImporter } from '@/lib/efactura/spv-bulk-importer';
import { Organization, Supplier, DocumentItem, SpendRecord } from '@/lib/types';

describe('STAGE 1: RO e-Factura / SPV Bulk Import Engine', () => {
  const importer = new SpvBulkImporter();

  const targetOrg: Organization = {
    id: 'org_real_acme',
    name: 'Acme Logistics SRL',
    cui: 'RO14399840',
    industry: 'Transport & Tehnologie',
    employeeRange: '10-49',
    monthlyOpexRon: 60000,
    saveScore: 82,
    isDemo: false,
    currency: 'RON',
    createdAt: '2026-01-01T00:00:00Z',
    verificationStatus: 'verified',
    vatRegistered: true,
  };

  const sampleXmlVodafone = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-88001</cbc:ID>
  <cbc:IssueDate>2026-08-20</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Vodafone România SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>8970105</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Acme Logistics SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">2500.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">2975.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">2975.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">2500.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Servicii Telecom Fleet</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">2500.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  const sampleXmlEmag = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>EMG-99002</cbc:ID>
  <cbc:IssueDate>2026-08-22</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Dante International SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Acme Logistics SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">1000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">1190.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">1190.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>2</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">1000.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Consumabile Birotica</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">500.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  it('1. Imports single valid RO e-Factura XML deterministically', () => {
    const invoices = [{ fileName: 'Factura_VDF.xml', xmlContent: sampleXmlVodafone }];
    const result = importer.processXmlInvoices(invoices, targetOrg, [], [], 'TestUser');

    expect(result.totalProcessed).toBe(1);
    expect(result.importedCount).toBe(1);
    expect(result.duplicatesCount).toBe(0);
    expect(result.invalidCount).toBe(0);
    expect(result.importedDocuments.length).toBe(1);
    expect(result.importedDocuments[0].extraction?.category).toBe('Telecom');
    expect(result.importedDocuments[0].extraction?.invoiceTotal).toBe(2975);
    expect(result.newSpendRecords.length).toBe(1);
    expect(result.updatedSuppliers.length).toBe(1);
    expect(result.updatedSuppliers[0].name).toBe('Vodafone România SA');
  });

  it('2. Imports multiple XML files in a single batch and correlates distinct suppliers', () => {
    const invoices = [
      { fileName: 'Factura_VDF.xml', xmlContent: sampleXmlVodafone },
      { fileName: 'Factura_EMG.xml', xmlContent: sampleXmlEmag },
    ];
    const result = importer.processXmlInvoices(invoices, targetOrg, [], [], 'TestUser');

    expect(result.totalProcessed).toBe(2);
    expect(result.importedCount).toBe(2);
    expect(result.newSpendRecords.length).toBe(2);
    expect(result.updatedSuppliers.length).toBe(2);
  });

  it('3. Unpacks ZIP archive containing XML documents safely and processes all invoices', async () => {
    const zip = new JSZip();
    zip.file('subfolder/Factura_1.xml', sampleXmlVodafone);
    zip.file('Factura_2.xml', sampleXmlEmag);
    zip.file('unrelated_readme.txt', 'Acesta este un fisier text oarecare.');

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    const rawFiles = [{ name: 'SPV_Export_August_2026.zip', data: zipBuffer }];

    const extracted = await importer.extractXmlFiles(rawFiles);
    expect(extracted.length).toBe(2);

    const result = importer.processXmlInvoices(extracted, targetOrg, [], [], 'TestUser');
    expect(result.importedCount).toBe(2);
    expect(result.totalProcessed).toBe(2);
  });

  it('4. DEDUPLICATION: Importing the same invoice a second time creates 0 duplicates', () => {
    const invoices = [{ fileName: 'Factura_VDF.xml', xmlContent: sampleXmlVodafone }];
    const run1 = importer.processXmlInvoices(invoices, targetOrg, [], [], 'TestUser');
    expect(run1.importedCount).toBe(1);

    // Second run with run1's documents passed as existingDocs
    const run2 = importer.processXmlInvoices(
      invoices,
      targetOrg,
      run1.importedDocuments,
      run1.updatedSuppliers,
      'TestUser'
    );

    expect(run2.importedCount).toBe(0);
    expect(run2.duplicatesCount).toBe(1);
    expect(run2.newSpendRecords.length).toBe(0);
    expect(run2.importedDocuments.length).toBe(0);
  });

  it('5. CUI VALIDATION: Rejects invoices where Buyer CUI does not match organization CUI', () => {
    const wrongBuyerXml = sampleXmlVodafone.replace(
      '<cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>',
      '<cac:PartyLegalEntity><cbc:CompanyID>77777777</cbc:CompanyID></cac:PartyLegalEntity>'
    );

    const invoices = [{ fileName: 'Factura_AltCui.xml', xmlContent: wrongBuyerXml }];
    const result = importer.processXmlInvoices(invoices, targetOrg, [], [], 'TestUser');

    expect(result.importedCount).toBe(0);
    expect(result.mismatchedCuiCount).toBe(1);
    expect(result.errors[0]).toContain('aparține altei companii');
    expect(result.newSpendRecords.length).toBe(0);
    expect(result.importedDocuments.length).toBe(0);
  });

  it('6. MALFORMED XML: Handles non-XML or damaged files gracefully without crashing', () => {
    const badInvoices = [
      { fileName: 'Broken.xml', xmlContent: '<NotAnInvoice><Random>text</Random></NotAnInvoice>' },
      { fileName: 'Empty.xml', xmlContent: '' },
    ];
    const result = importer.processXmlInvoices(badInvoices, targetOrg, [], [], 'TestUser');

    expect(result.importedCount).toBe(0);
    expect(result.invalidCount).toBe(2);
    expect(result.errors.length).toBe(2);
  });
});
