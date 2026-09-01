import { describe, it, expect } from 'vitest';
import { isScraperAuthorized, SCRAPER_MASTER_PASSWORD } from '../lib/prospects/scraper-auth';
import { NextRequest } from 'next/server';

describe('Scraper Master Security Gate', () => {
  it('has the exact master password configured', () => {
    expect(SCRAPER_MASTER_PASSWORD).toBe('Mutupalermo123@1');
  });

  it('rejects requests without authentication header', () => {
    const req = new NextRequest('http://localhost:3000/api/prospects');
    expect(isScraperAuthorized(req)).toBe(false);
  });

  it('rejects requests with incorrect password', () => {
    const req = new NextRequest('http://localhost:3000/api/prospects', {
      headers: {
        'x-scraper-key': 'WrongPassword123',
      },
    });
    expect(isScraperAuthorized(req)).toBe(false);
  });

  it('authorizes requests with correct x-scraper-key header', () => {
    const req = new NextRequest('http://localhost:3000/api/prospects', {
      headers: {
        'x-scraper-key': 'Mutupalermo123@1',
      },
    });
    expect(isScraperAuthorized(req)).toBe(true);
  });

  it('authorizes requests with Bearer token', () => {
    const req = new NextRequest('http://localhost:3000/api/prospects', {
      headers: {
        authorization: 'Bearer Mutupalermo123@1',
      },
    });
    expect(isScraperAuthorized(req)).toBe(true);
  });
});
