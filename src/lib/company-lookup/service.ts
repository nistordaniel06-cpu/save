import { CompanyLookupProvider, CompanyLookupResult, CompanyLookupError } from './types';
import { validateAndNormalizeCui } from './cui-validator';
import { AnafCompanyLookupProvider } from './providers/anaf-provider';

// Simple in-memory cache to save external calls for repeated queries (TTL 10 minutes)
interface CacheEntry {
  result: CompanyLookupResult | null;
  timestamp: number;
}

const lookupCache = new Map<number, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export class CompanyLookupService {
  private providers: CompanyLookupProvider[];

  constructor(providers?: CompanyLookupProvider[]) {
    this.providers = providers || [new AnafCompanyLookupProvider()];
  }

  public async lookupCompany(inputCui: string | number): Promise<{
    success: boolean;
    company?: CompanyLookupResult;
    error?: CompanyLookupError;
  }> {
    // 1. Validation & normalization
    const validation = validateAndNormalizeCui(inputCui);
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          code: 'INVALID_CUI',
          message: validation.errorMessage || 'CUI invalid',
          userMessage: validation.errorMessage || 'CUI-ul introdus nu pare valid.',
        },
      };
    }

    const cuiNum = validation.cuiNumeric;

    // 2. Check cache
    const cached = lookupCache.get(cuiNum);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      if (cached.result) {
        return { success: true, company: cached.result };
      }
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Company with CUI ${cuiNum} not found (cached)`,
          userMessage: 'Nu am găsit automat compania. Poți completa datele manual.',
        },
      };
    }

    // 3. Iterate providers
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        const result = await provider.lookup(cuiNum);
        if (result) {
          lookupCache.set(cuiNum, { result, timestamp: Date.now() });
          return { success: true, company: result };
        }
      } catch (err: any) {
        console.warn(`[CompanyLookupService] Provider ${provider.name} error:`, err?.message || err);
        lastError = err;
      }
    }

    // If no provider returned data:
    if (lastError) {
      const isTimeout = lastError.message?.includes('TIMEOUT');
      return {
        success: false,
        error: {
          code: isTimeout ? 'TIMEOUT' : 'SERVICE_UNAVAILABLE',
          message: lastError.message || 'Lookup service unavailable',
          userMessage: 'Serviciul de verificare nu este disponibil momentan. Poți continua și completa datele manual.',
        },
      };
    }

    // Provider responded normally, but company was not found
    lookupCache.set(cuiNum, { result: null, timestamp: Date.now() });
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Company with CUI ${cuiNum} not found in public registries`,
        userMessage: 'Nu am găsit automat compania. Poți completa datele manual.',
      },
    };
  }
}

// Export singleton instance for app-wide use
export const companyLookupService = new CompanyLookupService();
