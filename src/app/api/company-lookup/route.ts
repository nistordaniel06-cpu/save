import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { companyLookupService } from '@/lib/company-lookup/service';

const RequestSchema = z.object({
  cui: z.union([z.string(), z.number()]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CUI',
            message: 'Invalid input format',
            userMessage: 'Te rugăm să introduci un CUI/CIF valid.',
          },
        },
        { status: 400 }
      );
    }

    const { cui } = parseResult.data;
    const lookupResult = await companyLookupService.lookupCompany(cui);

    return NextResponse.json(lookupResult);
  } catch (error: any) {
    console.error('Unhandled company-lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: error?.message || 'Server error during lookup',
          userMessage: 'Serviciul de verificare nu este disponibil momentan. Poți continua și completa datele manual.',
        },
      },
      { status: 200 } // Friendly 200 with error payload so UI doesn't break
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const cuiParam = searchParams.get('cui');

  if (!cuiParam) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_CUI',
          message: 'Missing cui parameter',
          userMessage: 'Te rugăm să introduci un CUI/CIF.',
        },
      },
      { status: 400 }
    );
  }

  const lookupResult = await companyLookupService.lookupCompany(cuiParam);
  return NextResponse.json(lookupResult);
}
