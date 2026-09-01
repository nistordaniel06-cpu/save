import { describe, it, expect } from 'vitest';
import { 
  scrapeBucharestDecisionMakers, 
  BUCHAREST_DECISION_MAKERS 
} from '../lib/prospects/bucharest-people-scraper';
import { generatePersonPitch } from '../lib/prospects/people-pitch-engine';

describe('Bucharest B2B Decision-Maker Scraper & Pitch Engine', () => {
  it('contains comprehensive profiles of Bucharest business leaders', () => {
    expect(BUCHAREST_DECISION_MAKERS.length).toBeGreaterThanOrEqual(10);
    
    BUCHAREST_DECISION_MAKERS.forEach((person) => {
      expect(person.fullName).toBeTruthy();
      expect(person.roleTitle).toBeTruthy();
      expect(person.companyName).toBeTruthy();
      expect(person.cui).toMatch(/^RO\d+/);
      expect(person.sector).toBeTruthy();
      expect(person.districtArea).toBeTruthy();
      expect(person.email).toContain('@');
      expect(person.phone).toMatch(/^\+40/);
      expect(person.linkedinUrl).toContain('linkedin.com/in/');
      expect(person.saveScore).toBeGreaterThan(0);
      expect(person.estimatedAnnualSavingsMin).toBeGreaterThan(0);
    });
  });

  it('correctly filters decision-makers by specific role (CFO vs CEO vs Procurement)', () => {
    const cfos = scrapeBucharestDecisionMakers({ role: 'cfo' });
    expect(cfos.length).toBeGreaterThan(0);
    cfos.forEach((cfo) => {
      expect(cfo.roleCategory).toBe('cfo');
    });

    const ceos = scrapeBucharestDecisionMakers({ role: 'ceo' });
    expect(ceos.length).toBeGreaterThan(0);
    ceos.forEach((ceo) => {
      expect(ceo.roleCategory).toBe('ceo');
    });
  });

  it('correctly filters decision-makers by Bucharest Sector (e.g. Sector 1, Sector 2)', () => {
    const sector1 = scrapeBucharestDecisionMakers({ sector: 'Sector 1' });
    expect(sector1.length).toBeGreaterThan(0);
    sector1.forEach((person) => {
      expect(person.sector).toBe('Sector 1');
    });
  });

  it('filters decision-makers with critical SAVE scores (< 50%)', () => {
    const criticalLeaders = scrapeBucharestDecisionMakers({ maxSaveScore: 49 });
    expect(criticalLeaders.length).toBeGreaterThan(0);
    criticalLeaders.forEach((leader) => {
      expect(leader.saveScore).toBeLessThan(50);
    });
  });

  it('generates role-tailored pitch for CFO focusing on OPEX & EBITDA', () => {
    const cfo = BUCHAREST_DECISION_MAKERS.find((p) => p.roleCategory === 'cfo')!;
    const pitch = generatePersonPitch(cfo);

    expect(pitch.emailSubject).toContain('Optimizare OPEX');
    expect(pitch.emailBody).toContain(cfo.fullName);
    expect(pitch.emailBody).toContain(cfo.companyName);
    expect(pitch.emailBody).toContain('EBITDA');
    expect(pitch.linkedInConnectionNote.length).toBeLessThan(300); // LinkedIn 300-char note limit
  });

  it('generates role-tailored pitch for CEO focusing on bottom-line profit', () => {
    const ceo = BUCHAREST_DECISION_MAKERS.find((p) => p.roleCategory === 'ceo')!;
    const pitch = generatePersonPitch(ceo);

    expect(pitch.emailSubject).toContain('profitabilitate');
    expect(pitch.emailBody).toContain(ceo.companyName);
    expect(pitch.linkedInConnectionNote.length).toBeLessThan(300);
  });
});
