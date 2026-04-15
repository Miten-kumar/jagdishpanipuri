import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  deviceId: text("device_id").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
