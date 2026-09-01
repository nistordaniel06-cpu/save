export interface CompanyLookupResult {
  name: string;
  cui: string;
  cuiNumeric: number;
  registrationNumber?: string;
  vatRegistered: boolean;
  vatPayer: boolean;
  status: 'active' | 'inactive' | 'unknown';
  statusDetails?: string;
  address: string;
  city?: string;
  county?: string;
  postalCode?: string;
  roEfacturaRegistered?: boolean;
  caenCode?: string;
  caenDescription?: string;
  source: string;
  checkedAt: string;
}

export type CompanyLookupErrorCode = 
  | 'INVALID_CUI'
  | 'NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export interface CompanyLookupError {
  code: CompanyLookupErrorCode;
  message: string;
  userMessage: string;
}

export interface CompanyLookupProvider {
  name: string;
  lookup(cui: string | number): Promise<CompanyLookupResult | null>;
}
