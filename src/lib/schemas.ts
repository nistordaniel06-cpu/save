import { z } from 'zod';

export const SpendCategorySchema = z.enum([
  'Telecom',
  'Software',
  'Curierat',
  'Consumabile',
  'Energie',
  'Servicii',
  'Altele',
]);

export const DocumentTypeSchema = z.enum([
  'invoice',
  'supplier_contract',
  'subscription_agreement',
  'quote',
]);

export const DocumentExtractionSchema = z.object({
  supplier: z.string().min(1, 'Numele furnizorului este obligatoriu'),
  documentType: DocumentTypeSchema,
  category: SpendCategorySchema,
  invoiceTotal: z.number().nonnegative('Totalul trebuie să fie un număr pozitiv'),
  currency: z.string().default('RON'),
  billingPeriod: z.string().nullable().optional(),
  contractStart: z.string().nullable().optional(),
  contractEnd: z.string().nullable().optional(),
  noticePeriodDays: z.number().int().nullable().optional(),
  unitPrice: z.number().nullable().optional(),
  quantity: z.number().nullable().optional(),
  automaticRenewal: z.boolean().default(false),
  priceIndexation: z.string().nullable().optional(),
  confidence: z.number().min(0).max(100),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  needsReview: z.boolean().optional(),
  reviewNotes: z.string().nullable().optional(),
  rawPayload: z.record(z.string(), z.any()).nullable().optional(),
});

export type DocumentExtractionInput = z.infer<typeof DocumentExtractionSchema>;

export const OnboardingSchema = z.object({
  companyName: z.string().min(2, 'Denumirea companiei este obligatorie'),
  cui: z.string().optional(),
  industry: z.string().min(1, 'Selectează industria'),
  employeeRange: z.string().min(1, 'Selectează intervalul de angajați'),
  monthlyOpexRon: z.coerce.number().min(0, 'Cheltuielile lunare trebuie să fie pozitive'),
  majorCategories: z.array(SpendCategorySchema).min(1, 'Alege cel puțin o categorie principală'),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;

export const OptimizationRequestSchema = z.object({
  opportunityId: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().min(1, 'Numele furnizorului este necesar'),
  initialAnnualCost: z.number().positive(),
  clientNotes: z.string().max(1000).optional(),
});

export type OptimizationRequestInput = z.infer<typeof OptimizationRequestSchema>;

export const ManualReviewSchema = z.object({
  supplier: z.string().min(1, 'Numele furnizorului este obligatoriu'),
  documentType: DocumentTypeSchema,
  category: SpendCategorySchema,
  invoiceTotal: z.number().min(0),
  currency: z.string().min(1),
  contractStart: z.string().nullable().optional(),
  contractEnd: z.string().nullable().optional(),
  noticePeriodDays: z.number().nullable().optional(),
  automaticRenewal: z.boolean(),
  reviewNotes: z.string().optional(),
});

export type ManualReviewInput = z.infer<typeof ManualReviewSchema>;
