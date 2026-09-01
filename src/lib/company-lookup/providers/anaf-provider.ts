import { CompanyLookupProvider, CompanyLookupResult } from '../types';
import { normalizeCuiString } from '../cui-validator';

export class AnafCompanyLookupProvider implements CompanyLookupProvider {
  public readonly name = 'ANAF_API_V9';
  private readonly endpoint = 'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva';
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = 8000) {
    this.timeoutMs = timeoutMs;
  }

  public async lookup(cuiInput: string | number): Promise<CompanyLookupResult | null> {
    const cuiClean = normalizeCuiString(cuiInput);
    if (!cuiClean) return null;

    const cuiNumeric = parseInt(cuiClean, 10);
    if (isNaN(cuiNumeric)) return null;

    const today = new Date().toISOString().split('T')[0];
    const payload = [{ cui: cuiNumeric, data: today }];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SAVE-App/2.0 (Romanian Procurement Optimization Platform)',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`ANAF API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.found) || data.found.length === 0) {
        return null;
      }

      const item = data.found[0];
      const dg = item.date_generale || {};
      const tva = item.inregistrare_scop_Tva || {};
      const inactiv = item.stare_inactiv || {};
      const sediu = item.adresa_sediu_social || {};
      const fiscal = item.adresa_domiciliu_fiscal || {};

      // Determine active status
      const isInactive = Boolean(inactiv.statusInactivi);
      const status: 'active' | 'inactive' | 'unknown' = isInactive ? 'inactive' : 'active';

      // VAT status
      const vatRegistered = Boolean(tva.scpTVA);
      const vatPayer = vatRegistered;

      // Extract City and County
      const county = sediu.sdenumire_Judet || fiscal.ddenumire_Judet || '';
      const city = sediu.sdenumire_Localitate || fiscal.ddenumire_Localitate || '';
      const postalCode = sediu.scod_Postal || fiscal.dcod_Postal || dg.codPostal || '';

      // Full address
      const address = dg.adresa || [
        county ? `Jud. ${county}` : '',
        city,
        sediu.sdenumire_Strada ? `${sediu.sdenumire_Strada} ${sediu.snumar_Strada || ''}` : '',
        sediu.sdetalii_Adresa || '',
      ].filter(Boolean).join(', ');

      const result: CompanyLookupResult = {
        name: dg.denumire ? dg.denumire.trim() : `Companie CUI ${cuiNumeric}`,
        cui: `RO${cuiNumeric}`,
        cuiNumeric,
        registrationNumber: dg.nrRegCom || undefined,
        vatRegistered,
        vatPayer,
        status,
        statusDetails: dg.stare_inregistrare || (isInactive ? 'Inactivă fiscal' : 'Activă'),
        address: address.trim(),
        city: city || undefined,
        county: county || undefined,
        postalCode: postalCode || undefined,
        roEfacturaRegistered: Boolean(dg.statusRO_e_Factura),
        caenCode: dg.cod_CAEN || undefined,
        source: 'ANAF (Agenția Națională de Administrare Fiscală)',
        checkedAt: new Date().toISOString(),
      };

      return result;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('TIMEOUT: Serviciul ANAF nu a răspuns în timp util.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
