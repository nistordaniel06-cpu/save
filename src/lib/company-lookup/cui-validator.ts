/**
 * Romanian CUI/CIF (Cod Unic de Înregistrare / Cod de Identificare Fiscală) Normalization & Validation
 */

const CUI_WEIGHTS = [7, 5, 3, 2, 1, 7, 5, 3, 2];

export interface CuiValidationResult {
  isValid: boolean;
  cuiNumeric: number;
  cuiFormatted: string; // e.g. "RO12345678" or "12345678"
  raw: string;
  errorMessage?: string;
}

/**
 * Strips whitespace, 'RO' prefix, and non-digit characters.
 */
export function normalizeCuiString(rawInput: string | number): string {
  if (typeof rawInput === 'number') {
    return rawInput.toString();
  }
  if (!rawInput) return '';
  return rawInput
    .toString()
    .trim()
    .toUpperCase()
    .replace(/^RO\s*/i, '')
    .replace(/\D/g, '');
}

/**
 * Validates the mathematical checksum of a Romanian CUI/CIF according to the official Ministry of Finance formula.
 */
export function validateCuiChecksum(cuiStr: string): boolean {
  if (!cuiStr || cuiStr.length < 2 || cuiStr.length > 10) {
    return false;
  }

  // Must contain only digits
  if (!/^\d+$/.test(cuiStr)) {
    return false;
  }

  const digits = cuiStr.split('').map(Number);
  const controlDigit = digits[digits.length - 1];
  const payloadDigits = digits.slice(0, digits.length - 1);

  // Align weights from the right
  const weights = CUI_WEIGHTS.slice(CUI_WEIGHTS.length - payloadDigits.length);

  let sum = 0;
  for (let i = 0; i < payloadDigits.length; i++) {
    sum += payloadDigits[i] * weights[i];
  }

  const remainder = (sum * 10) % 11;
  const calculatedControl = remainder === 10 ? 0 : remainder;

  return calculatedControl === controlDigit;
}

/**
 * Full CUI validation with helpful user-facing errors
 */
export function validateAndNormalizeCui(input: string | number): CuiValidationResult {
  const raw = String(input ?? '').trim();
  const normalized = normalizeCuiString(raw);

  if (!normalized) {
    return {
      isValid: false,
      cuiNumeric: 0,
      cuiFormatted: '',
      raw,
      errorMessage: 'Te rugăm să introduci un CUI/CIF.',
    };
  }

  if (normalized.length < 2 || normalized.length > 10) {
    return {
      isValid: false,
      cuiNumeric: Number(normalized) || 0,
      cuiFormatted: normalized,
      raw,
      errorMessage: 'CUI-ul introdus nu pare valid. Trebuie să conțină între 2 și 10 cifre.',
    };
  }

  const hasValidChecksum = validateCuiChecksum(normalized);
  const cuiNumeric = parseInt(normalized, 10);

  if (!hasValidChecksum) {
    return {
      isValid: false,
      cuiNumeric,
      cuiFormatted: `RO${normalized}`,
      raw,
      errorMessage: 'CUI-ul introdus nu pare valid.',
    };
  }

  return {
    isValid: true,
    cuiNumeric,
    cuiFormatted: `RO${normalized}`,
    raw,
  };
}
