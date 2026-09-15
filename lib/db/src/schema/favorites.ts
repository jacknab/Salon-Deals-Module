import { date, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const salonFavoritesTable = pgTable(
  "salon_favorites",
  {
    userId: text("user_id").notNull(),
    dealId: text("deal_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.userId, table.dealId] }),
  }),
);

export type SalonFavorite = typeof salonFavoritesTable.$inferSelect;