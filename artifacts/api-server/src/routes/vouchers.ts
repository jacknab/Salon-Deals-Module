import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, salonDealsTable, salonVouchersTable } from "@workspace/db";
import { requireAuth, userIdFromRequest } from "./auth";

const router: IRouter = Router();
const purchaseSchema = z.object({ quantity: z.number().int().min(1).max(4) });

function toVoucherResponse(
  voucher: typeof salonVouchersTable.$inferSelect,
  deal: typeof salonDealsTable.$inferSelect,
) {
  return {
    id: voucher.id,
    dealId: voucher.dealId,
    dealTitle: deal.title,
    salonName: deal.salonName,
    customerName: voucher.customerName,
    purchaseDate: voucher.purchaseDate,
    expiresAt: voucher.expiresAt,
    code: voucher.code,
    status: voucher.status,
    qrSeed: voucher.qrSeed,
    redeemedAt: voucher.redeemedAt?.toISOString() ?? null,
  };
}

function voucherCode(dealId: string): string {
  return `${dealId.slice(0, 3).toUpperCase()}-${randomUUID().slice(0, 3).toUpperCase()}-${randomUUID().slice(0, 3).toUpperCase()}`;
}

router.post("/deals/:id/purchase", requireAuth, async (req, res, next) => {
  try {
    const parsed = purchaseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [deal] = await db.select().from(salonDealsTable).where(eq(salonDealsTable.id, String(req.params.id)));
    if (!deal || deal.status !== "active") {
      res.status(404).json({ error: "Deal not found or no longer active" });
      return;
    }
    if (deal.purchasedCount + parsed.data.quantity > deal.capacity) {
      res.status(400).json({ error: "This deal does not have enough vouchers remaining" });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const vouchers = await db.transaction(async (tx) => {
      const inserted = [];
      for (let index = 0; index < parsed.data.quantity; index += 1) {
        const [voucher] = await tx.insert(salonVouchersTable).values({
          id: `v-${randomUUID()}`,
          userId: userIdFromRequest(req),
          dealId: deal.id,
          customerName: "Customer",
          purchaseDate: today,
          expiresAt: deal.endsAt,
          code: voucherCode(deal.id),
          status: "active",
          qrSeed: randomUUID(),
        }).returning();
        inserted.push(voucher);
      }
      await tx.update(salonDealsTable)
        .set({ purchasedCount: deal.purchasedCount + parsed.data.quantity })
        .where(eq(salonDealsTable.id, deal.id));
      return inserted;
    });
    res.status(201).json({ vouchers: vouchers.map((voucher) => toVoucherResponse(voucher, deal)) });
  } catch (error) {
    next(error);
  }
});

router.get("/me/vouchers", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select({ voucher: salonVouchersTable, deal: salonDealsTable })
      .from(salonVouchersTable)
      .innerJoin(salonDealsTable, eq(salonVouchersTable.dealId, salonDealsTable.id))
      .where(eq(salonVouchersTable.userId, userIdFromRequest(req)))
      .orderBy(desc(salonVouchersTable.createdAt));
    res.json(rows.map(({ voucher, deal }) => toVoucherResponse(voucher, deal)));
  } catch (error) {
    next(error);
  }
});

router.get("/salon/vouchers", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select({ voucher: salonVouchersTable, deal: salonDealsTable })
      .from(salonVouchersTable)
      .innerJoin(salonDealsTable, eq(salonVouchersTable.dealId, salonDealsTable.id))
      .where(eq(salonDealsTable.ownerId, userIdFromRequest(req)))
      .orderBy(desc(salonVouchersTable.createdAt));
    res.json(rows.map(({ voucher, deal }) => toVoucherResponse(voucher, deal)));
  } catch (error) {
    next(error);
  }
});

router.post("/salon/vouchers/:code/redeem", requireAuth, async (req, res, next) => {
  try {
    const rows = await db
      .select({ voucher: salonVouchersTable, deal: salonDealsTable })
      .from(salonVouchersTable)
      .innerJoin(salonDealsTable, eq(salonVouchersTable.dealId, salonDealsTable.id))
      .where(and(eq(salonVouchersTable.code, String(req.params.code).toUpperCase()), eq(salonDealsTable.ownerId, userIdFromRequest(req))));
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: "Voucher not found" });
      return;
    }
    if (row.voucher.status !== "active") {
      res.status(400).json({ error: "Voucher is no longer active" });
      return;
    }
    const [voucher] = await db.update(salonVouchersTable)
      .set({ status: "used", redeemedAt: new Date() })
      .where(eq(salonVouchersTable.id, row.voucher.id))
      .returning();
    res.json(toVoucherResponse(voucher, row.deal));
  } catch (error) {
    next(error);
  }
});

export default router;