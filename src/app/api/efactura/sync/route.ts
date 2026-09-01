import { NextRequest, NextResponse } from 'next/server';
import { efacturaSyncEngine } from '@/lib/efactura/sync-engine';
import { validateAndNormalizeCui } from '@/lib/company-lookup/cui-validator';
import { EfacturaRawMessage } from '@/lib/efactura/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organization, messages, existingDocs, existingSuppliers, existingSpend } = body;

    if (!organization || !organization.id) {
      return NextResponse.json({ success: false, error: 'Organizația este obligatorie pentru sincronizare' }, { status: 400 });
    }

    const cuiValidation = validateAndNormalizeCui(organization.cui || '');
    if (!cuiValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Compania nu are un CUI valid setat: ${cuiValidation.errorMessage}`,
      }, { status: 400 });
    }

    // Process incoming e-Factura messages
    const rawMessages: EfacturaRawMessage[] = messages || [];
    const result = efacturaSyncEngine.processMessages(
      rawMessages,
      organization,
      existingDocs || [],
      existingSuppliers || [],
      existingSpend || []
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Eroare la execuția sincronizării e-Factura' }, { status: 500 });
  }
}
