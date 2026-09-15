export type DealStatus = 'active' | 'paused' | 'archived' | 'sold-out' | 'expired';
export type VoucherStatus = 'active' | 'used' | 'expired';
export type OfferType = 'flat-rate' | 'cash-gift-card' | 'service-gift-card' | 'bookable';

export type Deal = {
  id: string; title: string; salonName: string; category: string; city: string;
  rating: number; reviewCount: number; image: string; originalPrice: number;
  dealPrice: number; discountPercent: number; savings: number; purchasedCount: number;
  capacity: number; startsAt: string; endsAt: string; description: string; highlights: string[];
  finePrint: string; status: DealStatus; offerType?: OfferType;
  serviceName?: string; giftCardValue?: number; firstTimeCustomerOnly?: boolean;
};

export type DealAvailability = 'scheduled' | 'active' | 'sold-out' | 'expired' | 'paused' | 'archived';

/**
 * Deal dates use the salon's local time: a selected start date begins at
 * 5:00 PM, and a selected end date closes at 4:59:59 PM.
 */
export function dealStartAt(date: string) {
  return new Date(`${date}T17:00:00`);
}

export function dealEndAt(date: string) {
  return new Date(`${date}T16:59:59.999`);
}

export function dealDateInputValue(isoDate: string) {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getDealAvailability(deal: Deal, now = new Date()): DealAvailability {
  if (deal.status === 'archived') return 'archived';
  if (deal.status === 'paused') return 'paused';
  if (now < new Date(deal.startsAt)) return 'scheduled';
  if (now > new Date(deal.endsAt)) return 'expired';
  if (deal.purchasedCount >= deal.capacity) return 'sold-out';
  return 'active';
}

export type Voucher = {
  id: string; dealId: string; dealTitle: string; salonName: string; customerName: string;
  purchaseDate: string; expiresAt: string; code: string; status: VoucherStatus; qrSeed: string;
};

export const seededDeals: Deal[] = [
  {
    id: 'saffron-cut', title: 'The Soft Reset: cut, gloss + finish', salonName: 'Saffron Studio',
    category: 'Hair', city: 'Brooklyn, NY', rating: 4.9, reviewCount: 184, image: '/images/editorial-hair.jpg',
    originalPrice: 180, dealPrice: 108, discountPercent: 40, savings: 72, purchasedCount: 47, capacity: 60,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-31T16:59:59.999', description: 'A considered refresh for hair that is ready for a little more light. Your stylist shapes, glosses, and finishes with a tailored blowout.',
    highlights: ['Consultation + shape', 'Dimensional shine gloss', 'Signature finish'], finePrint: 'For new clients or clients returning after 90 days. Valid Tuesday–Thursday.',
    status: 'active',
  },
  {
    id: 'studio-moss-nails', title: 'Slow manicure + sculpted gel', salonName: 'Studio Moss',
    category: 'Nails', city: 'Williamsburg, NY', rating: 4.8, reviewCount: 92, image: '/images/editorial-nails.jpg',
    originalPrice: 95, dealPrice: 59, discountPercent: 38, savings: 36, purchasedCount: 31, capacity: 45,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-11-28T16:59:59.999', description: 'A quiet, detail-first manicure with structured gel for a glossy finish that holds its shape.',
    highlights: ['Cuticle care', 'Structured gel overlay', 'One-color finish'], finePrint: 'Removal is not included. Valid Monday–Wednesday.',
    status: 'active',
  },
  {
    id: 'lumen-facial', title: 'The Lumen facial for city skin', salonName: 'Lumen House',
    category: 'Skin', city: 'Cobble Hill, NY', rating: 4.7, reviewCount: 138, image: '/images/editorial-facial.jpg',
    originalPrice: 165, dealPrice: 99, discountPercent: 40, savings: 66, purchasedCount: 52, capacity: 70,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-08T16:59:59.999', description: 'A 60-minute reset for skin that has been doing too much. Expect a considered cleanse, enzyme polish, and cool stone massage.',
    highlights: ['Skin consultation', 'Enzyme polish', 'Cool stone massage'], finePrint: 'Not suitable during active prescription retinoid use. Valid all week.',
    status: 'active',
  },
  {
    id: 'violet-color', title: 'Root refresh + silk press', salonName: 'Violet & Co.',
    category: 'Hair', city: 'Prospect Heights, NY', rating: 4.6, reviewCount: 76, image: '/images/editorial-hair.jpg',
    originalPrice: 145, dealPrice: 87, discountPercent: 40, savings: 58, purchasedCount: 19, capacity: 28,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-11-25T16:59:59.999', description: 'A precise root refresh with a soft, glassy finish for the week ahead.',
    highlights: ['Root application', 'Shampoo ritual', 'Silk press finish'], finePrint: 'For roots up to one inch. Consultation required for major color changes.',
    status: 'active',
  },
  {
    id: 'juniper-blowout', title: 'The Sunday blowout', salonName: 'Juniper Room',
    category: 'Hair', city: 'Fort Greene, NY', rating: 4.8, reviewCount: 61, image: '/images/editorial-hair.jpg',
    originalPrice: 85, dealPrice: 51, discountPercent: 40, savings: 34, purchasedCount: 14, capacity: 24,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-18T16:59:59.999', description: 'A polished, wearable blowout with a little extra time for shape, volume, and a smooth finish.',
    highlights: ['Wash and prep', 'Custom blowout', 'Finishing detail'], finePrint: 'Valid Sunday through Tuesday. Hair must be detangled before arrival.',
    status: 'active',
  },
  {
    id: 'pearl-gel', title: 'Pearl chrome gel manicure', salonName: 'Pearl Atelier',
    category: 'Nails', city: 'Greenpoint, NY', rating: 4.9, reviewCount: 117, image: '/images/editorial-nails.jpg',
    originalPrice: 110, dealPrice: 66, discountPercent: 40, savings: 44, purchasedCount: 38, capacity: 50,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-21T16:59:59.999', description: 'A high-shine gel manicure finished with a soft pearl chrome effect.',
    highlights: ['Cuticle care', 'Structured gel', 'Pearl chrome finish'], finePrint: 'Removal is not included. One chrome color per service.',
    status: 'active',
  },
  {
    id: 'marlow-pedi', title: 'Reset pedicure + foot massage', salonName: 'Marlow Beauty',
    category: 'Nails', city: 'Park Slope, NY', rating: 4.7, reviewCount: 84, image: '/images/editorial-nails.jpg',
    originalPrice: 90, dealPrice: 54, discountPercent: 40, savings: 36, purchasedCount: 22, capacity: 36,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-14T16:59:59.999', description: 'A restorative pedicure with thoughtful shaping, polish, and an unhurried foot massage.',
    highlights: ['Soak and shape', 'Polish finish', 'Foot massage'], finePrint: 'Valid Monday–Thursday. Gel removal is not included.',
    status: 'active',
  },
  {
    id: 'cedar-facial', title: 'Glow facial + cooling massage', salonName: 'Cedar Skin Studio',
    category: 'Skin', city: 'Williamsburg, NY', rating: 4.8, reviewCount: 103, image: '/images/editorial-facial.jpg',
    originalPrice: 150, dealPrice: 90, discountPercent: 40, savings: 60, purchasedCount: 41, capacity: 56,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-28T16:59:59.999', description: 'A brightening facial with a cooling massage to leave city skin calm and refreshed.',
    highlights: ['Skin consultation', 'Brightening cleanse', 'Cooling massage'], finePrint: 'Please arrive without makeup where possible. Not suitable during active prescription retinoid use.',
    status: 'active',
  },
  {
    id: 'moss-peel', title: 'Enzyme peel for fresh skin', salonName: 'Moss & Mineral',
    category: 'Skin', city: 'Carroll Gardens, NY', rating: 4.6, reviewCount: 58, image: '/images/editorial-facial.jpg',
    originalPrice: 135, dealPrice: 81, discountPercent: 40, savings: 54, purchasedCount: 16, capacity: 30,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-11T16:59:59.999', description: 'A gentle enzyme peel and hydration ritual for a smoother, brighter-looking finish.',
    highlights: ['Skin consultation', 'Enzyme peel', 'Hydration mask'], finePrint: 'Pause exfoliating products 48 hours before your appointment.',
    status: 'active',
  },
  {
    id: 'haven-color', title: 'Gloss treatment + finish', salonName: 'Haven Hair Co.',
    category: 'Hair', city: 'Bedford-Stuyvesant, NY', rating: 4.7, reviewCount: 69, image: '/images/editorial-hair.jpg',
    originalPrice: 125, dealPrice: 75, discountPercent: 40, savings: 50, purchasedCount: 27, capacity: 42,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-24T16:59:59.999', description: 'A custom gloss treatment with a soft finish that brings back shine and tone.',
    highlights: ['Color consultation', 'Custom gloss', 'Blowout finish'], finePrint: 'For refreshes and tone adjustments only. Major color changes require a separate consultation.',
    status: 'active',
  },
  {
    id: 'olive-brow', title: 'Brow shape + tint ritual', salonName: 'Olive Beauty Bar',
    category: 'Skin', city: 'Cobble Hill, NY', rating: 4.9, reviewCount: 132, image: '/images/editorial-facial.jpg',
    originalPrice: 70, dealPrice: 42, discountPercent: 40, savings: 28, purchasedCount: 35, capacity: 48,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-30T16:59:59.999', description: 'A tailored brow shape and tint designed to make the everyday routine easier.',
    highlights: ['Brow consultation', 'Shape and trim', 'Custom tint'], finePrint: 'A patch test may be required for first-time tint clients.',
    status: 'active',
  },
  {
    id: 'atlas-scalp', title: 'Scalp reset + nourishing mask', salonName: 'Atlas Rituals',
    category: 'Hair', city: 'Long Island City, NY', rating: 4.8, reviewCount: 88, image: '/images/editorial-hair.jpg',
    originalPrice: 100, dealPrice: 60, discountPercent: 40, savings: 40, purchasedCount: 18, capacity: 32,
    startsAt: '2026-09-01T17:00:00', endsAt: '2026-12-26T16:59:59.999', description: 'A restorative scalp treatment with a nourishing mask and relaxing head massage.',
    highlights: ['Scalp consultation', 'Purifying treatment', 'Head massage'], finePrint: 'Please arrive with dry hair and avoid heavy styling products before your visit.',
    status: 'active',
  },
];

export const seededVouchers: Voucher[] = [
  { id: 'v-2048', dealId: 'saffron-cut', dealTitle: seededDeals[0].title, salonName: seededDeals[0].salonName, customerName: 'Mara Chen', purchaseDate: '2026-09-08', expiresAt: '2026-12-31', code: 'SAF-7K2-91M', status: 'active', qrSeed: 'SAF7K291M' },
  { id: 'v-1904', dealId: 'studio-moss-nails', dealTitle: seededDeals[1].title, salonName: seededDeals[1].salonName, customerName: 'Mara Chen', purchaseDate: '2026-08-14', expiresAt: '2026-09-14', code: 'MOS-4D9-2QX', status: 'used', qrSeed: 'MOS4D92QX' },
  { id: 'v-1702', dealId: 'lumen-facial', dealTitle: seededDeals[2].title, salonName: seededDeals[2].salonName, customerName: 'Mara Chen', purchaseDate: '2026-01-21', expiresAt: '2026-02-21', code: 'LUM-8P4-6TA', status: 'expired', qrSeed: 'LUM8P46TA' },
];

export function loadLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function saveLocal<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }