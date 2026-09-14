export type DealStatus = 'active' | 'sold-out' | 'expired';
export type VoucherStatus = 'active' | 'used' | 'expired';

export type Deal = {
  id: string; title: string; salonName: string; category: string; city: string;
  rating: number; reviewCount: number; image: string; originalPrice: number;
  dealPrice: number; discountPercent: number; savings: number; purchasedCount: number;
  capacity: number; endsAt: string; description: string; highlights: string[];
  finePrint: string; status: DealStatus;
};

export type Voucher = {
  id: string; dealId: string; dealTitle: string; salonName: string; customerName: string;
  purchaseDate: string; expiresAt: string; code: string; status: VoucherStatus; qrSeed: string;
};

export const seededDeals: Deal[] = [
  {
    id: 'saffron-cut', title: 'The Soft Reset: cut, gloss + finish', salonName: 'Saffron Studio',
    category: 'Hair', city: 'Brooklyn, NY', rating: 4.9, reviewCount: 184, image: '/images/editorial-hair.jpg',
    originalPrice: 180, dealPrice: 108, discountPercent: 40, savings: 72, purchasedCount: 47, capacity: 60,
    endsAt: '2025-12-31T20:00:00', description: 'A considered refresh for hair that is ready for a little more light. Your stylist shapes, glosses, and finishes with a tailored blowout.',
    highlights: ['Consultation + shape', 'Dimensional shine gloss', 'Signature finish'], finePrint: 'For new clients or clients returning after 90 days. Valid Tuesday–Thursday.',
    status: 'active',
  },
  {
    id: 'studio-moss-nails', title: 'Slow manicure + sculpted gel', salonName: 'Studio Moss',
    category: 'Nails', city: 'Williamsburg, NY', rating: 4.8, reviewCount: 92, image: '/images/editorial-nails.jpg',
    originalPrice: 95, dealPrice: 59, discountPercent: 38, savings: 36, purchasedCount: 31, capacity: 45,
    endsAt: '2025-11-28T18:00:00', description: 'A quiet, detail-first manicure with structured gel for a glossy finish that holds its shape.',
    highlights: ['Cuticle care', 'Structured gel overlay', 'One-color finish'], finePrint: 'Removal is not included. Valid Monday–Wednesday.',
    status: 'active',
  },
  {
    id: 'lumen-facial', title: 'The Lumen facial for city skin', salonName: 'Lumen House',
    category: 'Skin', city: 'Cobble Hill, NY', rating: 4.7, reviewCount: 138, image: '/images/editorial-facial.jpg',
    originalPrice: 165, dealPrice: 99, discountPercent: 40, savings: 66, purchasedCount: 52, capacity: 70,
    endsAt: '2025-12-08T12:00:00', description: 'A 60-minute reset for skin that has been doing too much. Expect a considered cleanse, enzyme polish, and cool stone massage.',
    highlights: ['Skin consultation', 'Enzyme polish', 'Cool stone massage'], finePrint: 'Not suitable during active prescription retinoid use. Valid all week.',
    status: 'active',
  },
  {
    id: 'violet-color', title: 'Root refresh + silk press', salonName: 'Violet & Co.',
    category: 'Hair', city: 'Prospect Heights, NY', rating: 4.6, reviewCount: 76, image: '/images/editorial-hair.jpg',
    originalPrice: 145, dealPrice: 87, discountPercent: 40, savings: 58, purchasedCount: 19, capacity: 28,
    endsAt: '2025-11-25T16:00:00', description: 'A precise root refresh with a soft, glassy finish for the week ahead.',
    highlights: ['Root application', 'Shampoo ritual', 'Silk press finish'], finePrint: 'For roots up to one inch. Consultation required for major color changes.',
    status: 'active',
  },
];

export const seededVouchers: Voucher[] = [
  { id: 'v-2048', dealId: 'saffron-cut', dealTitle: seededDeals[0].title, salonName: seededDeals[0].salonName, customerName: 'Mara Chen', purchaseDate: '2025-10-08', expiresAt: '2025-12-31', code: 'SAF-7K2-91M', status: 'active', qrSeed: 'SAF7K291M' },
  { id: 'v-1904', dealId: 'studio-moss-nails', dealTitle: seededDeals[1].title, salonName: seededDeals[1].salonName, customerName: 'Mara Chen', purchaseDate: '2025-09-14', expiresAt: '2025-11-14', code: 'MOS-4D9-2QX', status: 'used', qrSeed: 'MOS4D92QX' },
  { id: 'v-1702', dealId: 'lumen-facial', dealTitle: seededDeals[2].title, salonName: seededDeals[2].salonName, customerName: 'Mara Chen', purchaseDate: '2025-07-21', expiresAt: '2025-09-21', code: 'LUM-8P4-6TA', status: 'expired', qrSeed: 'LUM8P46TA' },
];

export function loadLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function saveLocal<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }