import { describe, it, expect } from 'vitest';
import { calculateContractTimeline, calculateContractRadar } from '../lib/analytics/contract-calculator';
import { DEMO_CONTRACTS } from '../lib/demo-data';

describe('Contract Timeline & Renewal Radar Calculator', () => {
  it('correctly calculates days until expiry and notice deadline', () => {
    const timeline = calculateContractTimeline({
      startDate: '2024-09-28',
      expiryDate: '2026-09-28',
      noticePeriodDays: 30,
      automaticRenewal: true,
    }, '2026-08-31');

    expect(timeline.daysUntilExpiry).toBe(28);
    expect(timeline.noticeDeadline).toBe('2026-08-29');
    expect(timeline.isNoticeOverdue).toBe(true); // Since notice was Aug 29 and ref is Aug 31
    expect(timeline.isExpiringSoon).toBe(true);
  });

  it('correctly partitions contracts into 30, 60, 90 day radar windows', () => {
    const radar = calculateContractRadar(DEMO_CONTRACTS, '2026-08-31');

    expect(radar.totalContracts).toBe(5);
    expect(radar.expiringIn30Days.length).toBe(1); // Vodafone
    expect(radar.expiringIn60Days.length).toBe(1); // E.ON
    expect(radar.autoRenewalCount).toBe(5);
  });
});
