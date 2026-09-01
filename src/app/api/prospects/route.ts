import { NextRequest, NextResponse } from 'next/server';
import { scrapeRomanianLeads, fetchAnafCompanyData } from '@/lib/prospects/company-scraper';
import { generateProspectPitch } from '@/lib/prospects/lead-scoring';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry') || 'all';
    const city = searchParams.get('city') || 'all';
    const cuiLookup = searchParams.get('cui');

    if (cuiLookup) {
      const anafData = await fetchAnafCompanyData(cuiLookup);
      return NextResponse.json({ success: true, anaf: anafData });
    }

    const leads = scrapeRomanianLeads({ industry, city });

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Eroare la căutarea firmelor.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead } = body;

    if (!lead) {
      return NextResponse.json({ error: 'Lead data missing.' }, { status: 400 });
    }

    const pitches = generateProspectPitch(lead);
    return NextResponse.json({ success: true, pitches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
