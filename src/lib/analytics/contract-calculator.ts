import { ContractItem } from '../types';

export interface ContractRadarSummary {
  totalContracts: number;
  totalAnnualValueRon: number;
  expiringIn30Days: ContractItem[];
  expiringIn60Days: ContractItem[];
  expiringIn90Days: ContractItem[];
  urgentNoticeRequired: ContractItem[];
  autoRenewalCount: number;
}

export function calculateContractTimeline(
  contract: Pick<ContractItem, 'startDate' | 'expiryDate' | 'noticePeriodDays' | 'automaticRenewal'>,
  referenceDate: string = '2026-08-31'
): {
  daysUntilExpiry: number;
  noticeDeadline: string;
  daysUntilNotice: number;
  isNoticeOverdue: boolean;
  isExpiringSoon: boolean;
} {
  const ref = new Date(referenceDate);
  const expiry = new Date(contract.expiryDate);

  // Notice deadline = expiry date minus noticePeriodDays
  const noticeDeadlineDate = new Date(expiry);
  noticeDeadlineDate.setDate(noticeDeadlineDate.getDate() - contract.noticePeriodDays);
  const noticeDeadline = noticeDeadlineDate.toISOString().split('T')[0];

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.ceil((expiry.getTime() - ref.getTime()) / msPerDay);
  const daysUntilNotice = Math.ceil((noticeDeadlineDate.getTime() - ref.getTime()) / msPerDay);

  return {
    daysUntilExpiry,
    noticeDeadline,
    daysUntilNotice,
    isNoticeOverdue: daysUntilNotice <= 0,
    isExpiringSoon: daysUntilExpiry <= 90 && daysUntilExpiry >= 0,
  };
}

export function calculateContractRadar(
  contracts: ContractItem[],
  referenceDate: string = '2026-08-31'
): ContractRadarSummary {
  const enrichedContracts = (contracts || []).map((c) => {
    const timeline = calculateContractTimeline(c, referenceDate);
    return {
      ...c,
      daysUntilExpiry: timeline.daysUntilExpiry,
      noticeDeadline: timeline.noticeDeadline,
      daysUntilNotice: timeline.daysUntilNotice,
    };
  });

  const expiringIn30Days = enrichedContracts.filter((c) => (c.daysUntilExpiry ?? 999) <= 30 && (c.daysUntilExpiry ?? 0) >= 0);
  const expiringIn60Days = enrichedContracts.filter((c) => (c.daysUntilExpiry ?? 999) > 30 && (c.daysUntilExpiry ?? 999) <= 60);
  const expiringIn90Days = enrichedContracts.filter((c) => (c.daysUntilExpiry ?? 999) > 60 && (c.daysUntilExpiry ?? 999) <= 90);
  const urgentNoticeRequired = enrichedContracts.filter((c) => (c.daysUntilNotice ?? 999) <= 15);
  const autoRenewalCount = enrichedContracts.filter((c) => c.automaticRenewal).length;
  const totalAnnualValueRon = enrichedContracts.reduce((sum, c) => sum + c.annualValue, 0);

  return {
    totalContracts: enrichedContracts.length,
    totalAnnualValueRon,
    expiringIn30Days,
    expiringIn60Days,
    expiringIn90Days,
    urgentNoticeRequired,
    autoRenewalCount,
  };
}
