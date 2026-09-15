import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, salonDealsTable, salonFavoritesTable } from "@workspace/db";
import { requireAuth, userIdFromRequest } from "./auth";

const router: IRouter = Router();

async function favoriteIds(userId: string): Promise<{ favoriteDealIds: string[] }> {
  const rows = await db
    .select({ dealId: salonFavoritesTable.dealId })
    .from(salonFavoritesTable)
    .where(eq(salonFavoritesTable.userId, userId))
    .orderBy(asc(salonFavoritesTable.createdAt));
  return { favoriteDealIds: rows.map((row) => row.dealId) };
}

router.get("/me/favorites", requireAuth, async (req, res, next) => {
  try {
    res.json(await favoriteIds(userIdFromRequest(req)));
  } catch (error) {
    next(error);
  }
});

router.put("/me/favorites/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = userIdFromRequest(req);
    const dealId = String(req.params.id);
    const deal = await db.select({ id: salonDealsTable.id }).from(salonDealsTable).where(eq(salonDealsTable.id, dealId));
    if (!deal[0]) {
      res.status(404).json({ error: "Deal not found" });
      return;
    }
    await db.insert(salonFavoritesTable).values({ userId, dealId }).onConflictDoNothing();
    res.json(await favoriteIds(userId));
  } catch (error) {
    next(error);
  }
});

router.delete("/me/favorites/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = userIdFromRequest(req);
    await db.delete(salonFavoritesTable).where(and(eq(salonFavoritesTable.userId, userId), eq(salonFavoritesTable.dealId, String(req.params.id))));
    res.json(await favoriteIds(userId));
  } catch (error) {
    next(error);
  }
});

export default router;