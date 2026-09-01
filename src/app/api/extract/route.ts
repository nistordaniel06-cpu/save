import { NextRequest, NextResponse } from 'next/server';
import { processDocumentExtraction } from '@/lib/ai/extractor';
import { parseEFacturaXml } from '@/lib/ai/efactura-parser';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileName = '';
    let mimeType = 'application/pdf';
    let fileSizeBytes = 1024;
    let textContent: string | undefined;
    let fileBase64: string | undefined;
    let isDemoOrg = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      isDemoOrg = formData.get('isDemo') === 'true';

      if (!file) {
        return NextResponse.json({ error: 'Fișierul lipsește din cerere.' }, { status: 400 });
      }

      fileName = file.name;
      mimeType = file.type || 'application/pdf';
      fileSizeBytes = file.size;

      // Check if XML e-Factura
      if (fileName.toLowerCase().endsWith('.xml') || mimeType.includes('xml')) {
        textContent = await file.text();
      } else {
        // Read buffer for LLM / OCR
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileBase64 = buffer.toString('base64');
      }
    } else {
      // JSON payload
      const body = await req.json();
      fileName = body.fileName;
      mimeType = body.mimeType || 'application/pdf';
      fileSizeBytes = body.fileSizeBytes || 1024;
      textContent = body.textContent;
      fileBase64 = body.fileBase64;
      isDemoOrg = body.isDemo === true;

      if (!fileName) {
        return NextResponse.json(
          { error: 'Parametrul fileName este obligatoriu.' },
          { status: 400 }
        );
      }
    }

    // 1. Native deterministic XML e-Factura handling (Do NOT send XML to LLM)
    if (
      fileName.toLowerCase().endsWith('.xml') ||
      textContent?.includes('<Invoice') ||
      textContent?.includes('ubl')
    ) {
      if (textContent) {
        const parsed = parseEFacturaXml(textContent);
        if (parsed) {
          return NextResponse.json({
            success: true,
            extraction: {
              supplier: parsed.supplierName,
              documentType: 'invoice',
              category: parsed.category,
              invoiceNumber: parsed.invoiceNumber,
              invoiceDate: parsed.invoiceDate,
              dueDate: parsed.dueDate,
              invoiceTotal: parsed.invoiceTotal,
              currency: parsed.currency,
              billingPeriod: null,
              contractStart: null,
              contractEnd: null,
              noticePeriodDays: null,
              unitPrice: parsed.lineItems[0]?.unitPrice || null,
              quantity: parsed.lineItems[0]?.quantity || null,
              automaticRenewal: false,
              priceIndexation: null,
              confidence: 99,
              needsReview: false,
              reviewNotes: 'Validat determinist prin parser e-Factura UBL (ANAF compliant).',
              fieldConfidences: {
                supplier: 100,
                invoiceNumber: 100,
                invoiceDate: 100,
                invoiceTotal: 100,
                category: 95,
              },
              rawPayload: {
                supplierCui: parsed.supplierCui,
                customerName: parsed.customerName,
                customerCui: parsed.customerCui,
                lineItemsCount: parsed.lineItems.length,
              },
            },
            confidence: 99,
            provider: 'efactura_native_xml',
            fieldConfidences: {
              supplier: 100,
              invoiceNumber: 100,
              invoiceDate: 100,
              invoiceTotal: 100,
              category: 95,
            },
          });
        }
      }
    }

    // 2. Server-Side Extraction for PDF / Images / Text via LLM or strict validation
    const result = await processDocumentExtraction(
      {
        fileName,
        mimeType,
        fileSizeBytes,
        textContent,
        fileBase64,
      },
      undefined,
      isDemoOrg // only allow mock heuristic in demo mode
    );

    return NextResponse.json({
      success: true,
      extraction: result.extraction,
      confidence: result.confidence,
      provider: result.provider,
      fieldConfidences: result.fieldConfidences,
      validationErrors: result.validationErrors,
    });
  } catch (err: any) {
    console.error('API /api/extract error:', err);
    return NextResponse.json(
      { error: err.message || 'Eroare la procesarea documentului.' },
      { status: 500 }
    );
  }
}
