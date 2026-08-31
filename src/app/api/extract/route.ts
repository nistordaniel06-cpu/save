import { NextRequest, NextResponse } from 'next/server';
import { processDocumentExtraction } from '@/lib/ai/extractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, mimeType, fileSizeBytes, textContent, fileBase64 } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: 'Parametrul fileName este obligatoriu.' },
        { status: 400 }
      );
    }

    const result = await processDocumentExtraction({
      fileName,
      mimeType: mimeType || 'application/pdf',
      fileSizeBytes: fileSizeBytes || 1024,
      textContent,
      fileBase64,
    });

    return NextResponse.json({
      success: true,
      extraction: result.extraction,
      confidence: result.confidence,
      provider: result.provider,
      fieldConfidences: result.fieldConfidences,
    });
  } catch (err: any) {
    console.error('API /api/extract error:', err);
    return NextResponse.json(
      { error: err.message || 'Eroare la procesarea documentului.' },
      { status: 500 }
    );
  }
}
