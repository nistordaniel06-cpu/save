import { SpendCategory } from '../types';

export interface EFacturaParsedResult {
  supplierName: string;
  supplierCui: string;
  customerName: string;
  customerCui: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  invoiceTotal: number;
  netTotal: number;
  vatTotal: number;
  currency: string;
  category: SpendCategory;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  confidence: number;
  isEFactura: boolean;
}

/**
 * Intelligent categorization based on Romanian supplier names & invoice line descriptions
 */
export function categorizeInvoice(supplierName: string, linesDescription: string): SpendCategory {
  const text = `${supplierName} ${linesDescription}`.toLowerCase();

  if (
    text.includes('vodafone') ||
    text.includes('orange') ||
    text.includes('telekom') ||
    text.includes('digi') ||
    text.includes('rcs & rds') ||
    text.includes('abonament voce') ||
    text.includes('date mobile') ||
    text.includes('sim')
  ) {
    return 'Telecom';
  }

  if (
    text.includes('google') ||
    text.includes('microsoft') ||
    text.includes('aws') ||
    text.includes('amazon web') ||
    text.includes('adobe') ||
    text.includes('jira') ||
    text.includes('atlassian') ||
    text.includes('slack') ||
    text.includes('licenta') ||
    text.includes('subscription') ||
    text.includes('saas') ||
    text.includes('cloud') ||
    text.includes('hosting')
  ) {
    return 'Software';
  }

  if (
    text.includes('dpd') ||
    text.includes('fan courier') ||
    text.includes('sameday') ||
    text.includes('cargus') ||
    text.includes('gls') ||
    text.includes('dhl') ||
    text.includes('curierat') ||
    text.includes('expediere') ||
    text.includes('transport colete') ||
    text.includes('awb')
  ) {
    return 'Curierat';
  }

  if (
    text.includes('enel') ||
    text.includes('e.on') ||
    text.includes('eon') ||
    text.includes('engie') ||
    text.includes('electrica') ||
    text.includes('hidroelectrica') ||
    text.includes('energie electrica') ||
    text.includes('gaze naturale') ||
    text.includes('mwh') ||
    text.includes('kwh')
  ) {
    return 'Energie';
  }

  if (
    text.includes('lyreco') ||
    text.includes('papetarie') ||
    text.includes('birotica') ||
    text.includes('toner') ||
    text.includes('cartus') ||
    text.includes('hartie') ||
    text.includes('consumabile') ||
    text.includes('ambalaje') ||
    text.includes('birotică') ||
    text.includes('piese schimb')
  ) {
    return 'Consumabile';
  }

  if (
    text.includes('marketing') ||
    text.includes('reclama') ||
    text.includes('promovare') ||
    text.includes('facebook') ||
    text.includes('meta') ||
    text.includes('google ads') ||
    text.includes('publicitate') ||
    text.includes('seo') ||
    text.includes('campanie')
  ) {
    return 'Marketing';
  }

  if (
    text.includes('chirie') ||
    text.includes('spatiu comercial') ||
    text.includes('inchiriere birou') ||
    text.includes('locatie') ||
    text.includes('sediu')
  ) {
    return 'Chirie';
  }

  if (
    text.includes('transport') ||
    text.includes('marfa') ||
    text.includes('flota') ||
    text.includes('camion') ||
    text.includes('combustibil') ||
    text.includes('motorina') ||
    text.includes('benzina') ||
    text.includes('omv') ||
    text.includes('rompetrol') ||
    text.includes('mol')
  ) {
    return 'Transport';
  }

  if (
    text.includes('mentenanta') ||
    text.includes('reparatie') ||
    text.includes('service') ||
    text.includes('intretinere') ||
    text.includes('revizie')
  ) {
    return 'Mentenanță';
  }

  if (
    text.includes('echipament') ||
    text.includes('laptop') ||
    text.includes('computer') ||
    text.includes('imprimanta') ||
    text.includes('utilaj') ||
    text.includes('hardware')
  ) {
    return 'Echipamente';
  }

  if (
    text.includes('avocat') ||
    text.includes('contabilitate') ||
    text.includes('audit') ||
    text.includes('consultanta') ||
    text.includes('notar') ||
    text.includes('juridic')
  ) {
    return 'Servicii';
  }

  return 'Servicii';
}

/**
 * Universal UBL 2.1 / CIUS-RO e-Factura XML Parser
 * Works seamlessly in both Node.js and Browser environments.
 */
export function parseEFacturaXml(xmlContent: string): EFacturaParsedResult | null {
  if (!xmlContent || (!xmlContent.includes('Invoice') && !xmlContent.includes('ubl'))) {
    return null;
  }

  // Must contain essential UBL invoice components
  if (
    !xmlContent.includes('AccountingSupplierParty') && 
    !xmlContent.includes('AccountingCustomerParty') && 
    !xmlContent.includes('LegalMonetaryTotal')
  ) {
    return null;
  }

  // Regex-based robust XML extractor (independent of DOMParser / Node-XML dependencies)
  const extractTag = (tag: string, source: string): string => {
    const match = source.match(new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'i'));
    return match ? match[1].trim() : '';
  };

  const invoiceNumber = extractTag('ID', xmlContent) || 'FAC-ANAF-001';
  const invoiceDate = extractTag('IssueDate', xmlContent) || new Date().toISOString().split('T')[0];
  const dueDate = extractTag('DueDate', xmlContent) || null;

  // Supplier info
  const supplierSection = extractTag('AccountingSupplierParty', xmlContent);
  const supplierName = 
    extractTag('RegistrationName', supplierSection) || 
    extractTag('Name', supplierSection) || 
    'Furnizor e-Factura';
  const supplierCui = extractTag('CompanyID', supplierSection) || '';

  // Customer info
  const customerSection = extractTag('AccountingCustomerParty', xmlContent);
  const customerName = 
    extractTag('RegistrationName', customerSection) || 
    extractTag('Name', customerSection) || 
    'Client';
  const customerCui = extractTag('CompanyID', customerSection) || '';

  // Monetary Totals
  const legalMonetaryTotal = extractTag('LegalMonetaryTotal', xmlContent);
  const payableAmountRaw = extractTag('PayableAmount', legalMonetaryTotal);
  const netAmountRaw = extractTag('TaxExclusiveAmount', legalMonetaryTotal);
  const vatAmountRaw = extractTag('TaxInclusiveAmount', legalMonetaryTotal);

  const currencyMatch = legalMonetaryTotal.match(/currencyID="([A-Z]{3})"/i) || xmlContent.match(/DocumentCurrencyCode[^>]*>([A-Z]{3})</i);
  const currency = currencyMatch ? currencyMatch[1] : 'RON';

  const invoiceTotal = parseFloat(payableAmountRaw.replace(',', '.')) || 0;
  const netTotal = parseFloat(netAmountRaw.replace(',', '.')) || (invoiceTotal > 0 ? Number((invoiceTotal / 1.19).toFixed(2)) : 0);
  const vatTotal = parseFloat(vatAmountRaw.replace(',', '.')) ? parseFloat(vatAmountRaw.replace(',', '.')) - netTotal : Number((invoiceTotal - netTotal).toFixed(2));

  // Line items
  const lineItemMatches = xmlContent.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceLine[\s\S]*?<\/(?:[a-zA-Z0-9_-]+:)?InvoiceLine>/gi) || [];
  const lineItems: EFacturaParsedResult['lineItems'] = [];
  let allDescriptions = '';

  lineItemMatches.forEach((lineXml) => {
    const desc = extractTag('Name', lineXml) || extractTag('Description', lineXml) || 'Serviciu / Produs';
    const qty = parseFloat(extractTag('InvoicedQuantity', lineXml).replace(',', '.')) || 1;
    const priceSection = extractTag('Price', lineXml);
    const unitPrice = parseFloat(extractTag('PriceAmount', priceSection).replace(',', '.')) || 0;
    const lineTotal = parseFloat(extractTag('LineExtensionAmount', lineXml).replace(',', '.')) || (qty * unitPrice);

    allDescriptions += ` ${desc}`;
    lineItems.push({
      description: desc,
      quantity: qty,
      unitPrice,
      lineTotal,
    });
  });

  const category = categorizeInvoice(supplierName, allDescriptions);

  return {
    supplierName,
    supplierCui,
    customerName,
    customerCui,
    invoiceNumber,
    invoiceDate,
    dueDate,
    invoiceTotal: invoiceTotal > 0 ? invoiceTotal : lineItems.reduce((s, l) => s + l.lineTotal, 0),
    netTotal,
    vatTotal,
    currency,
    category,
    lineItems,
    confidence: 100, // e-Factura XML is 100% deterministic
    isEFactura: true,
  };
}
