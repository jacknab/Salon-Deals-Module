import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, salonDealsTable } from "@workspace/db";
import { requireAuth, userIdFromRequest } from "./auth";

const router: IRouter = Router();

const dealInputSchema = z.object({
  salonName: z.string().trim().min(1),
  category: z.string().trim().min(1),
  city: z.string().trim().min(1),
  title: z.string().trim().min(1),
  offerType: z.enum(["flat-rate", "cash-gift-card", "service-gift-card", "bookable"]),
  serviceName: z.string().nullable().optional(),
  giftCardValue: z.number().int().min(0).nullable().optional(),
  image: z.string().default(""),
  originalPrice: z.number().int().min(0),
  dealPrice: z.number().int().min(0),
  capacity: z.number().int().min(1),
  endsAt: z.string().min(1),
  description: z.string(),
  highlights: z.array(z.string()),
  finePrint: z.string(),
});

const dealUpdateSchema = dealInputSchema.partial().extend({
  status: z.enum(["active", "paused", "archived", "sold-out", "expired"]).optional(),
});

const seededDeals = [
  {
    id: "saffron-cut",
    title: "The Soft Reset: cut, gloss + finish",
    salonName: "Saffron Studio",
    category: "Hair",
    city: "Brooklyn, NY",
    offerType: "flat-rate" as const,
    image: "/images/editorial-hair.jpg",
    rating: 4.9,
    reviewCount: 184,
    originalPrice: 180,
    dealPrice: 108,
    discountPercent: 40,
    savings: 72,
    purchasedCount: 47,
    capacity: 60,
    endsAt: "2026-12-31",
    description: "A considered refresh for hair that is ready for a little more light. Your stylist shapes, glosses, and finishes with a tailored blowout.",
    highlights: ["Consultation + shape", "Dimensional shine gloss", "Signature finish"],
    finePrint: "For new clients or clients returning after 90 days. Valid Tuesday–Thursday.",
    status: "active" as const,
  },
  {
    id: "studio-moss-nails",
    title: "Slow manicure + sculpted gel",
    salonName: "Studio Moss",
    category: "Nails",
    city: "Williamsburg, NY",
    offerType: "flat-rate" as const,
    image: "/images/editorial-nails.jpg",
    rating: 4.8,
    reviewCount: 92,
    originalPrice: 95,
    dealPrice: 59,
    discountPercent: 38,
    savings: 36,
    purchasedCount: 31,
    capacity: 45,
    endsAt: "2026-11-28",
    description: "A quiet, detail-first manicure with structured gel for a glossy finish that holds its shape.",
    highlights: ["Cuticle care", "Structured gel overlay", "One-color finish"],
    finePrint: "Removal is not included. Valid Monday–Wednesday.",
    status: "active" as const,
  },
  {
    id: "lumen-facial",
    title: "The Lumen facial for city skin",
    salonName: "Lumen House",
    category: "Skin",
    city: "Cobble Hill, NY",
    offerType: "flat-rate" as const,
    image: "/images/editorial-facial.jpg",
    rating: 4.7,
    reviewCount: 138,
    originalPrice: 165,
    dealPrice: 99,
    discountPercent: 40,
    savings: 66,
    purchasedCount: 52,
    capacity: 70,
    endsAt: "2026-12-08",
    description: "A 60-minute reset for skin that has been doing too much. Expect a considered cleanse, enzyme polish, and cool stone massage.",
    highlights: ["Skin consultation", "Enzyme polish", "Cool stone massage"],
    finePrint: "Not suitable during active prescription retinoid use. Valid all week.",
    status: "active" as const,
  },
  {
    id: "violet-color",
    title: "Root refresh + silk press",
    salonName: "Violet & Co.",
    category: "Hair",
    city: "Prospect Heights, NY",
    offerType: "flat-rate" as const,
    image: "/images/editorial-hair.jpg",
    rating: 4.6,
    reviewCount: 76,
    originalPrice: 145,
    dealPrice: 87,
    discountPercent: 40,
    savings: 58,
    purchasedCount: 19,
    capacity: 28,
    endsAt: "2026-11-25",
    description: "A precise root refresh with a soft, glassy finish for the week ahead.",
    highlights: ["Root application", "Shampoo ritual", "Silk press finish"],
    finePrint: "For roots up to one inch. Consultation required for major color changes.",
    status: "active" as const,
  },
];

export async function ensureSeededDeals(): Promise<void> {
  const existing = await db.select({ id: salonDealsTable.id }).from(salonDealsTable).limit(1);
  if (existing.length) return;
  await db.insert(salonDealsTable).values(seededDeals.map((deal) => ({ ...deal, ownerId: "system" })));
}

function toDealResponse(deal: typeof salonDealsTable.$inferSelect) {
  return {
    ...deal,
    endsAt: deal.endsAt,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  };
}

function imageForCategory(category: string): string {
  if (category === "Skin") return "/images/editorial-facial.jpg";
  if (category === "Nails") return "/images/editorial-nails.jpg";
  return "/images/editorial-hair.jpg";
}

router.get("/deals", async (_req, res, next) => {
  try {
    await ensureSeededDeals();
    const deals = await db
      .select()
      .from(salonDealsTable)
      .where(eq(salonDealsTable.status, "active"))
      .orderBy(asc(salonDealsTable.createdAt));
    res.json(deals.map(toDealResponse));
  } catch (error) {
    next(error);
  }
});

router.get("/salon/deals", requireAuth, async (req, res, next) => {
  try {
    const deals = await db
      .select()
      .from(salonDealsTable)
      .where(eq(salonDealsTable.ownerId, userIdFromRequest(req)));
    res.json(deals.map(toDealResponse));
  } catch (error) {
    next(error);
  }
});

router.post("/salon/deals", requireAuth, async (req, res, next) => {
  try {
    const parsed = dealInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const input = parsed.data;
    const discountPercent = input.originalPrice > input.dealPrice
      ? Math.max(1, Math.round((1 - input.dealPrice / input.originalPrice) * 100))
      : 0;
    const [deal] = await db.insert(salonDealsTable).values({
      id: `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deal"}-${randomUUID().slice(0, 8)}`,
      ...input,
      image: input.image || imageForCategory(input.category),
      rating: 5,
      reviewCount: 0,
      ownerId: userIdFromRequest(req),
      discountPercent,
      savings: Math.max(0, input.originalPrice - input.dealPrice),
      purchasedCount: 0,
      status: "active",
    }).returning();
    res.status(201).json(toDealResponse(deal));
  } catch (error) {
    next(error);
  }
});

router.patch("/salon/deals/:id", requireAuth, async (req, res, next) => {
  try {
    const parsed = dealUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const dealId = String(req.params.id);
    const existing = await db
      .select()
      .from(salonDealsTable)
      .where(and(eq(salonDealsTable.id, dealId), eq(salonDealsTable.ownerId, userIdFromRequest(req))));
    if (!existing[0]) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }
    const input = parsed.data;
    const nextDeal = { ...existing[0], ...input };
    const [deal] = await db.update(salonDealsTable).set({
      ...input,
      image: input.image || imageForCategory(input.category ?? existing[0].category),
      discountPercent: nextDeal.originalPrice > nextDeal.dealPrice
        ? Math.max(1, Math.round((1 - nextDeal.dealPrice / nextDeal.originalPrice) * 100))
        : 0,
      savings: Math.max(0, nextDeal.originalPrice - nextDeal.dealPrice),
    }).where(eq(salonDealsTable.id, dealId)).returning();
    res.json(toDealResponse(deal));
  } catch (error) {
    next(error);
  }
});

export default router;