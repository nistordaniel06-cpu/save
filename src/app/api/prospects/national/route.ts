import { NextRequest, NextResponse } from 'next/server';
import { 
  scrapeNationalLeads, 
  EntityType, 
  RomanianRegion 
} from '@/lib/prospects/national-scraper';
import { generateNationalPitch } from '@/lib/prospects/national-pitch-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') || 'all';
    const county = searchParams.get('county') || 'all';
    const region = searchParams.get('region') || 'all';
    const industry = searchParams.get('industry') || 'all';
    const scoreFilter = searchParams.get('scoreFilter') || 'all';
    const searchQuery = searchParams.get('search') || undefined;

    const leads = scrapeNationalLeads({
      entityType: entityType === 'all' ? undefined : (entityType as EntityType),
      county: county === 'all' ? undefined : county,
      region: region === 'all' ? undefined : (region as RomanianRegion),
      industry: industry === 'all' ? undefined : industry,
      scoreFilter: scoreFilter === 'all' ? undefined : (scoreFilter as any),
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead } = body;

    if (!lead) {
      return NextResponse.json({ error: 'Lead data missing.' }, { status: 400 });
    }

    const pitch = generateNationalPitch(lead);
    return NextResponse.json({ success: true, pitch });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
