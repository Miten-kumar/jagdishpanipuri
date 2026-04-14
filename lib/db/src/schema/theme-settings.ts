import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const themeSettingsTable = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  primaryColor: text("primary_color").notNull().default("25 90% 55%"),
  secondaryColor: text("secondary_color").notNull().default("30 85% 96%"),
  accentColor: text("accent_color").notNull().default("15 80% 50%"),
  fontFamily: text("font_family").notNull().default("Inter"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettingsTable).omit({ id: true, updatedAt: true });
export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;
export type ThemeSettings = typeof themeSettingsTable.$inferSelect;
