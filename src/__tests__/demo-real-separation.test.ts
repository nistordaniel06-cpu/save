import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getDefaultDemoState, 
  getEmptyRealState, 
  getSavedDemoState, 
  saveDemoState, 
  resetDemoState, 
  getSavedRealState, 
  saveRealState, 
  clearRealState,
  EMPTY_ORG_PLACEHOLDER
} from '../lib/store';
import { DEMO_ORG, DEMO_DOCUMENTS, DEMO_CONTRACTS, DEMO_SAVINGS_OPPORTUNITIES } from '../lib/demo-data';

// Mock in-memory storage for Node.js test environment
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) || null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

if (!globalThis.localStorage) {
  (globalThis as any).localStorage = new MemoryStorage();
}

describe('Demo Mode vs Real Production Mode Separation', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('provides an empty initial state for real production accounts', () => {
    const realState = getEmptyRealState({ id: 'user_real_1', email: 'cfo@companie.ro', fullName: 'Ioan Popescu' });

    expect(realState.currentOrg.id).toBe('');
    expect(realState.currentOrg.name).toBe('');
    expect(realState.currentOrg.isDemo).toBe(false);
    expect(realState.organizations).toEqual([]);
    expect(realState.documents).toEqual([]);
    expect(realState.contracts).toEqual([]);
    expect(realState.opportunities).toEqual([]);
    expect(realState.spendRecords).toEqual([]);
    expect(realState.currentUser.id).toBe('user_real_1');
    expect(realState.currentUser.email).toBe('cfo@companie.ro');
    expect(realState.currentUser.fullName).toBe('Ioan Popescu');
  });

  it('provides the full simulated dataset for demo mode', () => {
    const demoState = getDefaultDemoState();

    expect(demoState.currentOrg.id).toBe(DEMO_ORG.id);
    expect(demoState.currentOrg.name).toBe('Nova Retail SRL');
    expect(demoState.currentOrg.isDemo).toBe(true);
    expect(demoState.organizations.length).toBe(1);
    expect(demoState.documents.length).toBe(DEMO_DOCUMENTS.length);
    expect(demoState.contracts.length).toBe(DEMO_CONTRACTS.length);
    expect(demoState.opportunities.length).toBe(DEMO_SAVINGS_OPPORTUNITIES.length);
  });

  it('keeps real state and demo state in isolated localStorage keys', () => {
    const realState = getEmptyRealState({ id: 'user_99', email: 'test@real.ro' });
    const demoState = getDefaultDemoState();

    saveRealState(realState);
    saveDemoState(demoState);

    const loadedReal = getSavedRealState();
    const loadedDemo = getSavedDemoState();

    expect(loadedReal).not.toBeNull();
    expect(loadedReal?.currentOrg.isDemo).toBe(false);
    expect(loadedReal?.documents.length).toBe(0);

    expect(loadedDemo).not.toBeNull();
    expect(loadedDemo?.currentOrg.name).toBe('Nova Retail SRL');
    expect(loadedDemo?.currentOrg.isDemo).toBe(true);
    expect(loadedDemo?.documents.length).toBeGreaterThan(0);
  });

  it('resetDemoState only clears demo data and does not touch real state', () => {
    const realState = getEmptyRealState({ id: 'user_real', email: 'real@sme.ro' });
    realState.organizations = [{
      id: 'org_real_custom',
      name: 'Custom SME SRL',
      cui: 'RO 12345678',
      industry: 'IT, Software & Tehnologie',
      employeeRange: '10-49 angajați',
      monthlyOpexRon: 50000,
      saveScore: 0,
      isDemo: false,
      currency: 'RON',
      createdAt: '2026-09-01T00:00:00Z',
    }];
    saveRealState(realState);

    // Reset demo
    resetDemoState();

    const loadedRealAfterDemoReset = getSavedRealState();
    expect(loadedRealAfterDemoReset?.organizations.length).toBe(1);
    expect(loadedRealAfterDemoReset?.organizations[0].name).toBe('Custom SME SRL');
  });

  it('clearRealState removes real state without deleting demo dataset', () => {
    const demoState = getDefaultDemoState();
    saveDemoState(demoState);

    clearRealState();

    const loadedReal = getSavedRealState();
    const loadedDemo = getSavedDemoState();

    expect(loadedReal).toBeNull();
    expect(loadedDemo?.currentOrg.name).toBe('Nova Retail SRL');
  });
});
