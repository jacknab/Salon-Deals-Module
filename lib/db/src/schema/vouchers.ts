import { createInsertSchema } from "drizzle-zod";
import { date, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const salonVouchersTable = pgTable(
  "salon_vouchers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    dealId: text("deal_id").notNull(),
    customerName: text("customer_name").notNull(),
    purchaseDate: date("purchase_date", { mode: "string" }).notNull(),
    expiresAt: date("expires_at", { mode: "string" }).notNull(),
    code: text("code").notNull(),
    status: text("status").notNull().default("active"),
    qrSeed: text("qr_seed").notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeIndex: uniqueIndex("salon_vouchers_code_idx").on(table.code),
  }),
);

export const insertSalonVoucherSchema = createInsertSchema(salonVouchersTable).omit({
  createdAt: true,
});

export type InsertSalonVoucher = z.infer<typeof insertSalonVoucherSchema>;
export type SalonVoucher = typeof salonVouchersTable.$inferSelect;