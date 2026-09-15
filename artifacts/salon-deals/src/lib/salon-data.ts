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