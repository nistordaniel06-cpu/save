import { DocumentExtractionSchema } from '../schemas';
import { BaseLLMProvider, MockHeuristicProvider, GeminiProvider, OpenAIProvider, AnthropicProvider, ExtractionRequest, ExtractionResult } from './llm-provider';
import { DocumentExtraction } from '../types';

export const CONFIDENCE_THRESHOLD_REVIEW = 85; // Below 85% requires manual review

export function getLLMProvider(providerName?: string): BaseLLMProvider {
  switch (providerName?.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    default:
      return new MockHeuristicProvider();
  }
}

export async function processDocumentExtraction(
  request: ExtractionRequest,
  providerName?: string
): Promise<{
  extraction: Omit<DocumentExtraction, 'id' | 'documentId' | 'organizationId' | 'createdAt'>;
  isValid: boolean;
  validationErrors?: string[];
}> {
  const provider = getLLMProvider(providerName);
  const result: ExtractionResult = await provider.extract(request);

  // Validate with Zod
  const validation = DocumentExtractionSchema.safeParse(result.data);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return {
      extraction: {
        supplier: result.data.supplier || 'Necunoscut',
        documentType: result.data.documentType || 'invoice',
        category: result.data.category || 'Altele',
        invoiceTotal: result.data.invoiceTotal || 0,
        currency: result.data.currency || 'RON',
        confidence: 40,
        needsReview: true,
        reviewNotes: `Validare eșuată: ${errors.join(', ')}`,
        automaticRenewal: false,
      },
      isValid: false,
      validationErrors: errors,
    };
  }

  const validData = validation.data;
  const confidence = result.confidence;
  const needsReview = confidence < CONFIDENCE_THRESHOLD_REVIEW;

  let reviewNotes: string | undefined;
  if (needsReview) {
    reviewNotes = `Scor de încredere ${confidence}% (sub pragul optim de ${CONFIDENCE_THRESHOLD_REVIEW}%). Te rugăm să verifici câmpurile marcate.`;
  }

  return {
    extraction: {
      supplier: validData.supplier,
      documentType: validData.documentType,
      category: validData.category,
      invoiceNumber: validData.invoiceNumber ?? undefined,
      invoiceDate: validData.invoiceDate ?? undefined,
      dueDate: validData.dueDate ?? undefined,
      invoiceTotal: validData.invoiceTotal,
      currency: validData.currency,
      billingPeriod: validData.billingPeriod ?? undefined,
      contractStart: validData.contractStart ?? null,
      contractEnd: validData.contractEnd ?? null,
      noticePeriodDays: validData.noticePeriodDays ?? null,
      unitPrice: validData.unitPrice ?? null,
      quantity: validData.quantity ?? null,
      automaticRenewal: validData.automaticRenewal,
      priceIndexation: validData.priceIndexation ?? null,
      confidence,
      needsReview,
      reviewNotes,
      fieldConfidences: result.fieldConfidences,
      rawPayload: result.rawOutput,
    },
    isValid: true,
  };
}
