import { NextResponse } from 'next/server';
import { runAnafDiagnostics } from '@/lib/efactura/anaf-diagnostics';

export async function GET() {
  try {
    const report = runAnafDiagnostics();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
