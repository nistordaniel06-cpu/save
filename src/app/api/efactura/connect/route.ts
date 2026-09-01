import { NextRequest, NextResponse } from 'next/server';
import { isAnafOAuthConfigured, getAnafAuthUrl } from '@/lib/efactura/anaf-oauth';
import { validateAndNormalizeCui } from '@/lib/company-lookup/cui-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, cui } = body;

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'organizationId este obligatoriu' }, { status: 400 });
    }

    const cuiValidation = validateAndNormalizeCui(cui || '');
    if (!cuiValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `CUI invalid pentru conectare RO e-Factura: ${cuiValidation.errorMessage}`,
      }, { status: 400 });
    }

    const isConfigured = isAnafOAuthConfigured();
    
    // Return OAuth redirect or configuration status
    return NextResponse.json({
      success: true,
      configured: isConfigured,
      cui: cuiValidation.cuiFormatted,
      cuiNumeric: cuiValidation.cuiNumeric,
      authUrl: isConfigured ? getAnafAuthUrl(organizationId) : null,
      message: isConfigured 
        ? 'Redirecționare către portalul securizat ANAF SPV...' 
        : 'Configurarea acreditării ANAF OAuth este necesară (ANAF_CLIENT_ID / ANAF_CLIENT_SECRET).',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Eroare la inițierea conexiunii e-Factura' }, { status: 500 });
  }
}
