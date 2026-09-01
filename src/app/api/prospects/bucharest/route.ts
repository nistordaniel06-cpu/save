import { NextRequest, NextResponse } from 'next/server';
import { scrapeBucharestDecisionMakers, DecisionMakerRole } from '@/lib/prospects/bucharest-people-scraper';
import { generatePersonPitch } from '@/lib/prospects/people-pitch-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'all';
    const sector = searchParams.get('sector') || 'all';
    const industry = searchParams.get('industry') || 'all';
    const maxSaveScore = searchParams.get('maxSaveScore') ? parseInt(searchParams.get('maxSaveScore')!, 10) : undefined;
    const searchQuery = searchParams.get('search') || undefined;

    const people = scrapeBucharestDecisionMakers({
      role: role === 'all' ? undefined : (role as DecisionMakerRole),
      sector: sector === 'all' ? undefined : sector,
      industry: industry === 'all' ? undefined : industry,
      maxSaveScore,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      total: people.length,
      people,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { person } = body;

    if (!person) {
      return NextResponse.json({ error: 'Person profile missing.' }, { status: 400 });
    }

    const pitch = generatePersonPitch(person);
    return NextResponse.json({ success: true, pitch });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
