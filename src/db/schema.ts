import { pgTable, text, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  profilePictureUrl: text("profile_picture_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preferences = pgTable("preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  defaultExportFormat: text("default_export_format").default("image/png"),
  defaultQuality: integer("default_quality").default(90),
  theme: text("theme").default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  amount: integer("amount").notNull(), // Amount in paise (29900 = ₹299)
  currency: text("currency").default("INR").notNull(),
  status: text("status").default("created").notNull(), // created, paid, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(), // e.g., "PIXEL-ABC123"
  successfulReferrals: integer("successful_referrals").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralUsages = pgTable("referral_usages", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralCodeId: uuid("referral_code_id")
    .notNull()
    .references(() => referralCodes.id, { onDelete: "cascade" }),
  referredUserId: uuid("referred_user_id")
    .notNull()
    .unique() // A user can only use one referral code ever
    .references(() => users.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(), // "pending" | "paid"
  discountApplied: integer("discount_applied").default(0).notNull(), // Amount in paise
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Preferences = typeof preferences.$inferSelect;
export type NewPreferences = typeof preferences.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;
export type ReferralUsage = typeof referralUsages.$inferSelect;
export type NewReferralUsage = typeof referralUsages.$inferInsert;
