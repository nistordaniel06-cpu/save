import { NextRequest } from 'next/server';

export const SCRAPER_MASTER_PASSWORD = 'Mutupalermo123@1';

export function isScraperAuthorized(req: NextRequest): boolean {
  const key = req.headers.get('x-scraper-key') || req.headers.get('authorization');
  if (key === SCRAPER_MASTER_PASSWORD || key === `Bearer ${SCRAPER_MASTER_PASSWORD}`) {
    return true;
  }
  return false;
}
