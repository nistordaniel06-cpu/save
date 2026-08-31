import { describe, it, expect } from 'vitest';
import { parseEFacturaXml, categorizeInvoice } from '../lib/ai/efactura-parser';

describe('Romanian e-Factura (UBL 2.1 XML) Parser', () => {
  const sampleEFacturaXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>VDF-2026-88192</cbc:ID>
  <cbc:IssueDate>2026-08-31</cbc:IssueDate>
  <cbc:DueDate>2026-09-30</cbc:DueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>RO8970105</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Vodafone România SA</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>RO38491024</cbc:CompanyID>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Nova Retail SRL</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="RON">1288.51</cbc:TaxExclusiveAmount>
    <cbc:PayableAmount currencyID="RON">1533.33</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity>24</cbc:InvoicedQuantity>
    <cac:Item>
      <cbc:Name>Abonamente Business Voce si Date Mobile 5G</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="RON">53.68</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  it('successfully parses standard UBL 2.1 e-Factura XML', () => {
    const result = parseEFacturaXml(sampleEFacturaXml);

    expect(result).not.toBeNull();
    expect(result?.invoiceNumber).toBe('VDF-2026-88192');
    expect(result?.supplierName).toBe('Vodafone România SA');
    expect(result?.supplierCui).toBe('RO8970105');
    expect(result?.customerName).toBe('Nova Retail SRL');
    expect(result?.customerCui).toBe('RO38491024');
    expect(result?.invoiceTotal).toBe(1533.33);
    expect(result?.netTotal).toBe(1288.51);
    expect(result?.currency).toBe('RON');
    expect(result?.category).toBe('Telecom');
    expect(result?.confidence).toBe(100);
    expect(result?.isEFactura).toBe(true);
    expect(result?.lineItems.length).toBe(1);
    expect(result?.lineItems[0].quantity).toBe(24);
  });

  it('accurately categorizes Romanian procurement invoices', () => {
    expect(categorizeInvoice('DPD Dynamic Parcel Distribution SA', 'Servicii nationale curierat')).toBe('Curierat');
    expect(categorizeInvoice('Google Ireland Ltd', 'Google Workspace Enterprise licente')).toBe('Software');
    expect(categorizeInvoice('E.ON Energie Romania SA', 'Consum energie electrica JT')).toBe('Energie');
    expect(categorizeInvoice('Lyreco Romania SRL', 'Papetarie si consumabile birou')).toBe('Consumabile');
    expect(categorizeInvoice('ContExpert Advisory SRL', 'Servicii contabilitate si salarizare')).toBe('Servicii');
  });

  it('returns null safely for invalid non-XML strings', () => {
    const result = parseEFacturaXml('Random plain text without invoice tag');
    expect(result).toBeNull();
  });
});
