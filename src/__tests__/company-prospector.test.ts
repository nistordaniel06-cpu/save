import { describe, it, expect } from 'vitest';
import { scrapeRomanianLeads } from '../lib/prospects/company-scraper';
import { generateProspectPitch } from '../lib/prospects/lead-scoring';

describe('B2B Lead Scraper & Prospect Intelligence', () => {
  it('correctly filters Romanian companies by industry and city', () => {
    const clujRetail = scrapeRomanianLeads({ city: 'Cluj-Napoca', industry: 'Retail' });
    expect(clujRetail.length).toBeGreaterThan(0);
    expect(clujRetail[0].city).toBe('Cluj-Napoca');
    expect(clujRetail[0].industry).toContain('Retail');
  });

  it('calculates realistic OPEX and potential annual savings for leads', () => {
    const allLeads = scrapeRomanianLeads({});
    expect(allLeads.length).toBeGreaterThanOrEqual(8);

    allLeads.forEach((lead) => {
      expect(lead.estimatedAnnualSavingsMin).toBeGreaterThan(0);
      expect(lead.estimatedAnnualSavingsMax).toBeGreaterThan(lead.estimatedAnnualSavingsMin);
      expect(lead.opportunityScore).toBeGreaterThanOrEqual(80);
      expect(lead.topSpendCategories.length).toBeGreaterThan(0);
    });
  });

  it('generates personalized cold pitches containing company name, CUI, and savings estimate', () => {
    const lead = scrapeRomanianLeads({ city: 'București' })[0];
    const pitch = generateProspectPitch(lead);

    expect(pitch.emailSubject).toContain(lead.name);
    expect(pitch.emailBody).toContain(lead.name);
    expect(pitch.emailBody).toContain(lead.industry);
    expect(pitch.whatsAppMessage).toContain(lead.name);
    expect(pitch.linkedInMessage).toContain(lead.name);
    expect(pitch.keyTalkingPoints.length).toBeGreaterThan(0);
  });
});
