import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const salonDealsTable = pgTable("salon_deals", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  salonName: text("salon_name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  title: text("title").notNull(),
  offerType: text("offer_type").notNull(),
  serviceName: text("service_name"),
  giftCardValue: integer("gift_card_value"),
  image: text("image").notNull(),
  rating: real("rating").notNull().default(5),
  reviewCount: integer("review_count").notNull().default(0),
  originalPrice: integer("original_price").notNull(),
  dealPrice: integer("deal_price").notNull(),
  discountPercent: integer("discount_percent").notNull().default(0),
  savings: integer("savings").notNull().default(0),
  purchasedCount: integer("purchased_count").notNull().default(0),
  capacity: integer("capacity").notNull(),
  endsAt: date("ends_at", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  highlights: text("highlights").array().notNull(),
  finePrint: text("fine_print").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSalonDealSchema = createInsertSchema(salonDealsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertSalonDeal = z.infer<typeof insertSalonDealSchema>;
export type SalonDeal = typeof salonDealsTable.$inferSelect;