import { describe, it, expect } from 'vitest';
import { 
  scrapeNationalLeads, 
  NATIONAL_LEADS_DATABASE 
} from '../lib/prospects/national-scraper';
import { generateNationalPitch } from '../lib/prospects/national-pitch-engine';

describe('Master National Romania Scraper (PJ + PF)', () => {
  it('contains leads across both Persoane Juridice and Persoane Fizice / Profesii Liberale', () => {
    const pjLeads = NATIONAL_LEADS_DATABASE.filter((l) => l.entityType === 'juridica');
    const pfLeads = NATIONAL_LEADS_DATABASE.filter((l) => l.entityType === 'fizica_profesie_liberala');

    expect(pjLeads.length).toBeGreaterThanOrEqual(5);
    expect(pfLeads.length).toBeGreaterThanOrEqual(4);
  });

  it('filters by county across different regions of Romania', () => {
    const clujLeads = scrapeNationalLeads({ county: 'Cluj' });
    expect(clujLeads.length).toBeGreaterThan(0);
    clujLeads.forEach((l) => expect(l.county).toBe('Cluj'));

    const timisLeads = scrapeNationalLeads({ county: 'Timiș' });
    expect(timisLeads.length).toBeGreaterThan(0);
    timisLeads.forEach((l) => expect(l.county).toBe('Timiș'));

    const iasiLeads = scrapeNationalLeads({ county: 'Iași' });
    expect(iasiLeads.length).toBeGreaterThan(0);
    iasiLeads.forEach((l) => expect(l.county).toBe('Iași'));
  });

  it('filters by entity type (Persoane Fizice vs Persoane Juridice)', () => {
    const pfOnly = scrapeNationalLeads({ entityType: 'fizica_profesie_liberala' });
    expect(pfOnly.length).toBeGreaterThan(0);
    pfOnly.forEach((l) => {
      expect(l.entityType).toBe('fizica_profesie_liberala');
    });

    const pjOnly = scrapeNationalLeads({ entityType: 'juridica' });
    expect(pjOnly.length).toBeGreaterThan(0);
    pjOnly.forEach((l) => {
      expect(l.entityType).toBe('juridica');
    });
  });

  it('generates tailored pitch for Persoane Fizice / Profesii Liberale', () => {
    const pfLead = NATIONAL_LEADS_DATABASE.find((l) => l.entityType === 'fizica_profesie_liberala')!;
    const pitch = generateNationalPitch(pfLead);

    expect(pitch.emailSubject).toContain(pfLead.name);
    expect(pitch.emailBody).toContain(pfLead.decisionMakerName);
    expect(pitch.emailBody).toContain(pfLead.city);
    expect(pitch.whatsAppMessage).toContain(pfLead.name);
    expect(pitch.keyTalkingPoints.length).toBeGreaterThan(0);
  });

  it('generates tailored pitch for Persoane Juridice (Corporate)', () => {
    const pjLead = NATIONAL_LEADS_DATABASE.find((l) => l.entityType === 'juridica')!;
    const pitch = generateNationalPitch(pjLead);

    expect(pitch.emailSubject).toContain('Scor SAVE');
    expect(pitch.emailBody).toContain(pjLead.name);
    expect(pitch.emailBody).toContain('EBITDA');
    expect(pitch.whatsAppMessage).toContain(pjLead.name);
  });
});
