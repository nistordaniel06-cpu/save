import { describe, it, expect } from 'vitest';
import { processDocumentExtraction, CONFIDENCE_THRESHOLD_REVIEW } from '../lib/ai/extractor';
import { DocumentExtractionSchema } from '../lib/schemas';

describe('Document Extraction AI Pipeline & Zod Validation', () => {
  it('validates a well-formed invoice payload via Zod schema', () => {
    const validPayload = {
      supplier: 'Vodafone România SA',
      documentType: 'invoice' as const,
      category: 'Telecom' as const,
      invoiceTotal: 1533.33,
      currency: 'RON',
      billingPeriod: 'August 2026',
      automaticRenewal: true,
      confidence: 96,
    };

    const parsed = DocumentExtractionSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid payloads with negative totals or missing supplier', () => {
    const invalidPayload = {
      supplier: '',
      documentType: 'invoice' as const,
      category: 'Telecom' as const,
      invoiceTotal: -50,
      currency: 'RON',
      confidence: 90,
      automaticRenewal: false,
    };

    const parsed = DocumentExtractionSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('automatically flags extractions with confidence < 85% for manual review', async () => {
    const result = await processDocumentExtraction({
      fileName: 'Scan_Factura_Consumabile_Birotica_Neclara.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 512000,
    });

    expect(result.isValid).toBe(true);
    expect(result.extraction.confidence).toBeLessThan(CONFIDENCE_THRESHOLD_REVIEW);
    expect(result.extraction.needsReview).toBe(true);
    expect(result.extraction.reviewNotes).toContain('sub 85%');
  });

  it('does not flag high-confidence extractions', async () => {
    const result = await processDocumentExtraction({
      fileName: 'Factura_Vodafone_Enterprise.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 240000,
    });

    expect(result.isValid).toBe(true);
    expect(result.extraction.confidence).toBeGreaterThanOrEqual(85);
    expect(result.extraction.needsReview).toBe(false);
  });
});
