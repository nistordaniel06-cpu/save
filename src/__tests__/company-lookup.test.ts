import { describe, it, expect } from 'vitest';
import { validateAndNormalizeCui, normalizeCuiString, validateCuiChecksum } from '@/lib/company-lookup/cui-validator';
import { companyLookupService } from '@/lib/company-lookup/service';

describe('Romanian CUI Validation & Normalization', () => {
  it('normalizes various Romanian CUI input formats', () => {
    expect(normalizeCuiString('RO14399840')).toBe('14399840');
    expect(normalizeCuiString('ro 14399840 ')).toBe('14399840');
    expect(normalizeCuiString('  RO 1590120  ')).toBe('1590120');
    expect(normalizeCuiString(14399840)).toBe('14399840');
    expect(normalizeCuiString('RO-123456')).toBe('123456');
  });

  it('validates official Romanian CUI checksums correctly', () => {
    // Dante International (eMAG)
    expect(validateCuiChecksum('14399840')).toBe(true);
    // Romsilva
    expect(validateCuiChecksum('1590120')).toBe(true);
    // Invalid checksum
    expect(validateCuiChecksum('14399841')).toBe(false);
    expect(validateCuiChecksum('12345678')).toBe(false);
  });

  it('returns structured validation messages for invalid inputs', () => {
    const emptyResult = validateAndNormalizeCui('');
    expect(emptyResult.isValid).toBe(false);

    const badLengthResult = validateAndNormalizeCui('1');
    expect(badLengthResult.isValid).toBe(false);

    const badChecksumResult = validateAndNormalizeCui('RO99999999');
    expect(badChecksumResult.isValid).toBe(false);
    expect(badChecksumResult.errorMessage).toBe('CUI-ul introdus nu pare valid.');
  });

  it('performs live company lookup for valid registered company', async () => {
    // Dante International SA (CUI 14399840)
    const result = await companyLookupService.lookupCompany('RO14399840');
    expect(result.success).toBe(true);
    expect(result.company).toBeDefined();
    expect(result.company?.name).toContain('DANTE');
    expect(result.company?.cuiNumeric).toBe(14399840);
    expect(result.company?.vatRegistered).toBe(true);
    expect(result.company?.status).toBe('active');
  }, 15000);

  it('gracefully handles non-existent or invalid CUI without crashing', async () => {
    const invalidResult = await companyLookupService.lookupCompany('00000000');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error?.userMessage).toBeDefined();
  });
});
