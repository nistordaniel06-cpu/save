import { NextRequest, NextResponse } from 'next/server';
import { spvBulkImporter, SpvRawFile } from '@/lib/efactura/spv-bulk-importer';
import { Organization } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const orgRaw = formData.get('organization') as string;
      const uploaderName = (formData.get('uploaderName') as string) || 'Utilizator';
      const existingDocsRaw = formData.get('existingDocs') as string;
      const existingSuppliersRaw = formData.get('existingSuppliers') as string;

      if (!orgRaw) {
        return NextResponse.json({ success: false, error: 'Organizația este obligatorie' }, { status: 400 });
      }

      const organization: Organization = JSON.parse(orgRaw);
      const existingDocs = existingDocsRaw ? JSON.parse(existingDocsRaw) : [];
      const existingSuppliers = existingSuppliersRaw ? JSON.parse(existingSuppliersRaw) : [];

      const rawFiles: SpvRawFile[] = [];
      const entries = Array.from(formData.entries());

      for (const [key, value] of entries) {
        if (value instanceof Blob && key.startsWith('file')) {
          const arrayBuffer = await value.arrayBuffer();
          rawFiles.push({
            name: (value as any).name || 'document.xml',
            data: arrayBuffer,
          });
        }
      }

      if (rawFiles.length === 0) {
        return NextResponse.json({ success: false, error: 'Nu a fost încărcat niciun fișier XML sau ZIP' }, { status: 400 });
      }

      // Step 1: Extract all XMLs from ZIPs / raw files
      const extractedXmls = await spvBulkImporter.extractXmlFiles(rawFiles);

      if (extractedXmls.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Arhiva sau fișierele încărcate nu conțin documente XML e-Factura valide.',
        }, { status: 400 });
      }

      // Step 2: Deterministic processing & CUI verification
      const result = spvBulkImporter.processXmlInvoices(
        extractedXmls,
        organization,
        existingDocs,
        existingSuppliers,
        uploaderName
      );

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    // JSON fallback payload
    const body = await req.json();
    const { invoices, organization, existingDocs, existingSuppliers, uploaderName } = body;

    if (!organization || !invoices || !Array.isArray(invoices)) {
      return NextResponse.json({ success: false, error: 'Date de intrare invalide' }, { status: 400 });
    }

    const result = spvBulkImporter.processXmlInvoices(
      invoices,
      organization,
      existingDocs || [],
      existingSuppliers || [],
      uploaderName || 'Utilizator'
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error in SPV bulk import:', err);
    return NextResponse.json({ success: false, error: err.message || 'Eroare la importul fișierelor din SPV' }, { status: 500 });
  }
}
