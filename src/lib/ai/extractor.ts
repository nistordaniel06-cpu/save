import { DocumentExtractionSchema } from '../schemas';
import { 
  BaseLLMProvider, 
  MockHeuristicProvider, 
  GeminiProvider, 
  OpenAIProvider, 
  EFacturaProvider,
  ExtractionRequest, 
  ExtractionResult 
} from './llm-provider';
import { DocumentExtraction } from '../types';

export const CONFIDENCE_THRESHOLD_REVIEW = 85; // Sub 85% necesită revizuire manuală

export function getLLMProvider(request?: ExtractionRequest, providerName?: string, isDemo: boolean = false): BaseLLMProvider {
  if (providerName) {
    switch (providerName.toLowerCase()) {
      case 'efactura':
        return new EFacturaProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'openai':
        return new OpenAIProvider();
      default:
        return isDemo ? new MockHeuristicProvider() : new EFacturaProvider();
    }
  }

  // Automatic smart routing
  if (
    request?.fileName?.toLowerCase().endsWith('.xml') ||
    request?.textContent?.includes('<Invoice') ||
    request?.textContent?.includes('ubl')
  ) {
    return new EFacturaProvider();
  }

  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider();
  }

  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }

  // Only allow Mock in demo or tests
  if (isDemo || process.env.NODE_ENV === 'test') {
    return new MockHeuristicProvider();
  }

  // Real mode without configured LLM keys -> strict review requirement
  return new MockHeuristicProvider();
}

export async function processDocumentExtraction(
  request: ExtractionRequest,
  providerName?: string,
  isDemo: boolean = false
): Promise<{
  extraction: Omit<DocumentExtraction, 'id' | 'documentId' | 'organizationId' | 'createdAt'>;
  isValid: boolean;
  confidence: number;
  provider: string;
  fieldConfidences: Record<string, number>;
  validationErrors?: string[];
}> {
  // If real mode and no LLM keys and not XML -> do not invent data
  const isXml = request.fileName?.toLowerCase().endsWith('.xml') || request.textContent?.includes('<Invoice');
  const hasLlmKey = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

  if (!isDemo && process.env.NODE_ENV !== 'test' && !isXml && !hasLlmKey) {
    return {
      extraction: {
        supplier: 'Furnizor de identificat',
        documentType: request.fileName.toLowerCase().includes('contract') ? 'supplier_contract' : 'invoice',
        category: 'Servicii',
        invoiceTotal: 0,
        currency: 'RON',
        confidence: 10,
        needsReview: true,
        reviewNotes: 'Documentul nu a putut fi analizat automat și necesită verificare.',
        automaticRenewal: false,
      },
      isValid: false,
      confidence: 10,
      provider: 'needs_manual_review',
      fieldConfidences: {},
      validationErrors: ['Furnizor LLM neconfigurat. Document trimis spre verificare manuală.'],
    };
  }

  const provider = getLLMProvider(request, providerName, isDemo);
  const result: ExtractionResult = await provider.extract(request);

  // Validate with Zod
  const validation = DocumentExtractionSchema.safeParse(result.data);

  if (!validation.success) {
    const errors = validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return {
      extraction: {
        supplier: result.data.supplier || 'Necunoscut',
        documentType: result.data.documentType || 'invoice',
        category: result.data.category || 'Servicii',
        invoiceTotal: result.data.invoiceTotal || 0,
        currency: result.data.currency || 'RON',
        confidence: 40,
        needsReview: true,
        reviewNotes: `Validare eșuată: ${errors.join(', ')}`,
        automaticRenewal: false,
      },
      isValid: false,
      confidence: 40,
      provider: provider.name,
      fieldConfidences: result.fieldConfidences,
      validationErrors: errors,
    };
  }

  const validData = validation.data;
  const confidence = result.confidence;
  const needsReview = confidence < CONFIDENCE_THRESHOLD_REVIEW;

  let reviewNotes = validData.reviewNotes;
  if (needsReview && !reviewNotes) {
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
      contractStart: validData.contractStart ?? undefined,
      contractEnd: validData.contractEnd ?? undefined,
      noticePeriodDays: validData.noticePeriodDays ?? undefined,
      unitPrice: validData.unitPrice ?? undefined,
      quantity: validData.quantity ?? undefined,
      automaticRenewal: validData.automaticRenewal ?? false,
      priceIndexation: validData.priceIndexation ?? undefined,
      confidence,
      needsReview,
      reviewNotes: reviewNotes ?? undefined,
      fieldConfidences: result.fieldConfidences,
      rawPayload: (result.rawOutput || validData.rawPayload) as any,
    },
    isValid: true,
    confidence,
    provider: provider.name,
    fieldConfidences: result.fieldConfidences,
  };
}
