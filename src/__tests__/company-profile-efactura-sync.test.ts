import { describe, it, expect } from 'vitest';
import { EfacturaSyncEngine } from '@/lib/efactura/sync-engine';
import { parseEFacturaXml } from '@/lib/ai/efactura-parser';
import { validateAndNormalizeCui } from '@/lib/company-lookup/cui-validator';
import { Organization, SpendRecord, Supplier, DocumentItem } from '@/lib/types';
import { EfacturaRawMessage } from '@/lib/efactura/types';

describe('Unified Company Data + RO e-Factura Sync Pipeline', () => {
  const testOrg: Organization = {
    id: 'org_alpha_77',
    name: 'Alpha Tech Logistics SRL',
    cui: 'RO14399840',
    industry: 'Transport & Tehnologie',
    employeeRange: '10-49',
    monthlyOpexRon: 50000,
    saveScore: 80,
    isDemo: false,
    currency: 'RON',
    createdAt: '2026-01-01T00:00:00Z',
    verificationStatus: 'verified',
    vatRegistered: true,
  };

  const sampleXmlVodafone = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-2026-001</cbc:ID>
  <cbc:IssueDate>2026-08-15</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Vodafone România SA</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>8970105</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>Alpha Tech Logistics SRL</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity><cbc:CompanyID>14399840</cbc:CompanyID></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">2000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="RON">2380.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="RON">2380.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>10</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="RON">2000.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Abonament Voce &amp; Date Mobile</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="RON">200.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  it('A. Deterministically parses UBL XML and identifies Telecom category', () => {
    const parsed = parseEFacturaXml(sampleXmlVodafone);
    expect(parsed).not.toBeNull();
    expect(parsed?.invoiceNumber).toBe('VDF-2026-001');
    expect(parsed?.supplierName).toBe('Vodafone România SA');
    expect(parsed?.supplierCui).toBe('8970105');
    expect(parsed?.customerCui).toBe('14399840');
    expect(parsed?.category).toBe('Telecom');
    expect(parsed?.invoiceTotal).toBe(2380);
    expect(parsed?.confidence).toBe(100);
  });

  it('B. Sincronizeaza factura si creeaza automat furnizor si spend record', () => {
    const engine = new EfacturaSyncEngine();
    const messages: EfacturaRawMessage[] = [
      {
        id: 'msg_001',
        data_creare: '2026-08-15',
        cui_emitent: '8970105',
        cui_destinatar: '14399840',
        tip: 'FACTURA PRIMITA',
        id_descarcare: 'd_001',
        xmlContent: sampleXmlVodafone,
      },
    ];

    const { result, newDocuments, newSpendRecords, updatedSuppliers } = engine.processMessages(
      messages,
      testOrg,
      [],
      [],
      []
    );

    expect(result.success).toBe(true);
    expect(result.importedInvoices.length).toBe(1);
    expect(newDocuments.length).toBe(1);
    expect(newSpendRecords.length).toBe(1);
    expect(newSpendRecords[0].category).toBe('Telecom');
    expect(updatedSuppliers.length).toBe(1);
    expect(updatedSuppliers[0].cui).toBe('RO8970105');
  });

  it('C. DEDUPLICARE: Sincronizarea aceleiasi facturi a doua oara returneaza 0 duplicate create', () => {
    const engine = new EfacturaSyncEngine();
    const messages: EfacturaRawMessage[] = [
      {
        id: 'msg_001',
        data_creare: '2026-08-15',
        cui_emitent: '8970105',
        cui_destinatar: '14399840',
        tip: 'FACTURA PRIMITA',
        id_descarcare: 'd_001',
        xmlContent: sampleXmlVodafone,
      },
    ];

    // Prima rulare
    const run1 = engine.processMessages(messages, testOrg, [], [], []);
    expect(run1.result.importedInvoices.length).toBe(1);
    expect(run1.result.duplicatesSkipped).toBe(0);

    // A doua rulare cu aceleasi documente existente
    const run2 = engine.processMessages(
      messages,
      testOrg,
      run1.newDocuments,
      run1.updatedSuppliers,
      run1.newSpendRecords
    );

    expect(run2.result.importedInvoices.length).toBe(0);
    expect(run2.result.duplicatesSkipped).toBe(1);
    expect(run2.newSpendRecords.length).toBe(0);
  });

  it('D. IDENTITY MATCH: Respinge facturile unde CUI-ul cumparatorului nu corespunde companiei conectate', () => {
    const engine = new EfacturaSyncEngine();
    const wrongBuyerXml = sampleXmlVodafone.replace('<cbc:CompanyID>14399840</cbc:CompanyID>', '<cbc:CompanyID>99999999</cbc:CompanyID>');

    const messages: EfacturaRawMessage[] = [
      {
        id: 'msg_wrong_cui',
        data_creare: '2026-08-15',
        cui_emitent: '8970105',
        cui_destinatar: '99999999',
        tip: 'FACTURA PRIMITA',
        id_descarcare: 'd_wrong',
        xmlContent: wrongBuyerXml,
      },
    ];

    const { result, newDocuments, newSpendRecords } = engine.processMessages(
      messages,
      testOrg,
      [],
      [],
      []
    );

    expect(result.importedInvoices.length).toBe(0);
    expect(result.mismatchedCuiCount).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(newDocuments.length).toBe(0);
    expect(newSpendRecords.length).toBe(0);
  });

  it('E. Reutilizeaza furnizorul existent cand CUI-ul furnizorului corespunde', () => {
    const engine = new EfacturaSyncEngine();
    const existingSupplier: Supplier = {
      id: 'sup_vodafone_existing',
      organizationId: testOrg.id,
      name: 'Vodafone RO',
      cui: 'RO8970105',
      category: 'Telecom',
      rating: 4.5,
      isPreferred: false,
      totalAnnualSpendRon: 5000,
      contractCount: 1,
      invoiceCount: 2,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const messages: EfacturaRawMessage[] = [
      {
        id: 'msg_002',
        data_creare: '2026-08-15',
        cui_emitent: '8970105',
        cui_destinatar: '14399840',
        tip: 'FACTURA PRIMITA',
        id_descarcare: 'd_002',
        xmlContent: sampleXmlVodafone,
      },
    ];

    const { updatedSuppliers } = engine.processMessages(
      messages,
      testOrg,
      [],
      [existingSupplier],
      []
    );

    expect(updatedSuppliers.length).toBe(1);
    expect(updatedSuppliers[0].id).toBe('sup_vodafone_existing');
    expect(updatedSuppliers[0].invoiceCount).toBe(3);
    expect(updatedSuppliers[0].totalAnnualSpendRon).toBe(5000 + 2380);
  });
});
