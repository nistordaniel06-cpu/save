import { 
  DemandPool, 
  DemandPoolMember, 
  VerifiedDemand, 
  AnonymousDemandPool, 
  SpendCategory 
} from '../types';

export const MIN_ANONYMOUS_POOL_MEMBERS = 3;

/**
 * Creates or updates aggregated demand pool metrics from its members
 */
export function aggregatePoolMetrics(
  pool: DemandPool,
  members: Array<{ member: DemandPoolMember; demand: VerifiedDemand }>
): DemandPool {
  const activeMembers = members.filter((m) => m.member.consentStatus === 'accepted');
  const totalCompanies = new Set(activeMembers.map((m) => m.member.organizationId)).size;
  const totalVolume = activeMembers.reduce((sum, m) => sum + (m.demand.volume || 0), 0);
  const totalCurrentAnnualSpend = activeMembers.reduce((sum, m) => sum + (m.demand.currentAnnualCost || 0), 0);

  let status = pool.status;
  if (totalCompanies >= MIN_ANONYMOUS_POOL_MEMBERS && status === 'building') {
    status = 'ready';
  }

  return {
    ...pool,
    totalCompanies,
    totalVolume,
    totalCurrentAnnualSpend,
    status,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Anonymizes a Demand Pool strictly protecting client identity and individual pricing
 * Returns null if privacy threshold (MIN_ANONYMOUS_POOL_MEMBERS) is not reached!
 */
export function toAnonymousPoolView(pool: DemandPool): AnonymousDemandPool | null {
  if (pool.totalCompanies < MIN_ANONYMOUS_POOL_MEMBERS) {
    return null;
  }

  // Rounded spend to avoid revealing individual contract values
  const approximateAnnualSpend = Math.round(pool.totalCurrentAnnualSpend / 1000) * 1000;

  return {
    poolId: pool.id,
    category: pool.category,
    subcategory: pool.subcategory,
    serviceType: pool.serviceType,
    title: pool.title,
    region: pool.region,
    currency: pool.currency,
    status: pool.status,
    totalCompanies: pool.totalCompanies,
    totalVolume: pool.totalVolume,
    approximateAnnualSpend,
    biddingStartsAt: pool.biddingStartsAt,
    biddingEndsAt: pool.biddingEndsAt,
  };
}

/**
 * Initial demo pools for Romanian SMEs in Telecom, Curierat, Software
 */
export const INITIAL_DEMAND_POOLS: DemandPool[] = [
  {
    id: 'pool_telecom_voice_data',
    category: 'Telecom',
    serviceType: 'Flotă SIM Voce & Date Mobile',
    title: 'Grup IMM: Abonamente Mobile & Trafic Date Nelimitat',
    region: 'Național',
    currency: 'RON',
    status: 'open_for_bids',
    totalCompanies: 8,
    totalVolume: 114, // 114 SIM-uri
    totalCurrentAnnualSpend: 78500,
    biddingStartsAt: '2026-08-25T08:00:00Z',
    biddingEndsAt: '2026-09-15T18:00:00Z',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'pool_curierat_national',
    category: 'Curierat',
    serviceType: 'Expedieri Colete Național Standard',
    title: 'Grup IMM: Expedieri Colete Naționale (Volum Cumulat 2500+ expedieri/lună)',
    region: 'Național',
    currency: 'RON',
    status: 'open_for_bids',
    totalCompanies: 14,
    totalVolume: 3200, // 3200 colete/lună
    totalCurrentAnnualSpend: 480000,
    biddingStartsAt: '2026-08-28T08:00:00Z',
    biddingEndsAt: '2026-09-20T18:00:00Z',
    createdAt: '2026-08-22T10:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z',
  },
  {
    id: 'pool_software_workspace',
    category: 'Software',
    serviceType: 'Abonamente Software & Licențe Utilizator',
    title: 'Grup IMM: Licențe Suită Productivitate Cloud & Securitate Endpoint',
    region: 'Național',
    currency: 'RON',
    status: 'building',
    totalCompanies: 5,
    totalVolume: 65, // 65 seats
    totalCurrentAnnualSpend: 54000,
    biddingStartsAt: '2026-09-05T08:00:00Z',
    biddingEndsAt: '2026-09-25T18:00:00Z',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z',
  },
];
