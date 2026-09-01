import { describe, it, expect } from 'vitest';
import { scrapeRomanianLeads } from '../lib/prospects/company-scraper';
import { generateProspectPitch } from '../lib/prospects/lead-scoring';

describe('Admin B2B Lead Scraper & Low SAVE Score Intelligence', () => {
  it('correctly filters Romanian companies by industry and city', () => {
    const clujRetail = scrapeRomanianLeads({ city: 'Cluj-Napoca', industry: 'Retail' });
    expect(clujRetail.length).toBeGreaterThan(0);
    expect(clujRetail[0].city).toBe('Cluj-Napoca');
    expect(clujRetail[0].industry).toContain('Retail');
  });

  it('correctly filters companies with CRITICAL low SAVE scores (< 50%)', () => {
    const criticalLeads = scrapeRomanianLeads({ scoreFilter: 'critical' });
    expect(criticalLeads.length).toBeGreaterThan(0);
    criticalLeads.forEach((lead) => {
      expect(lead.saveScore).toBeLessThan(50);
      expect(lead.saveScoreStatus).toBe('critical');
      expect(lead.criticalCostLeaks.length).toBeGreaterThan(0);
      expect(lead.opportunityScore).toBeGreaterThanOrEqual(90);
    });
  });

  it('calculates realistic OPEX and potential annual savings for leads', () => {
    const allLeads = scrapeRomanianLeads({});
    expect(allLeads.length).toBeGreaterThanOrEqual(8);

    allLeads.forEach((lead) => {
      expect(lead.estimatedAnnualSavingsMin).toBeGreaterThan(0);
      expect(lead.estimatedAnnualSavingsMax).toBeGreaterThan(lead.estimatedAnnualSavingsMin);
      expect(lead.topSpendCategories.length).toBeGreaterThan(0);
    });
  });

  it('generates personalized cold pitches referencing the company low SAVE score', () => {
    const lead = scrapeRomanianLeads({ scoreFilter: 'critical' })[0];
    const pitch = generateProspectPitch(lead);

    expect(pitch.emailSubject).toContain(lead.name);
    expect(pitch.emailSubject).toContain(`${lead.saveScore}/100`);
    expect(pitch.emailBody).toContain(lead.name);
    expect(pitch.emailBody).toContain(`${lead.saveScore}/100`);
    expect(pitch.whatsAppMessage).toContain(lead.name);
    expect(pitch.keyTalkingPoints.length).toBeGreaterThan(0);
  });
});
