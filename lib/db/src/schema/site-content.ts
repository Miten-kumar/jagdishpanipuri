import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteContentTable = pgTable("site_content", {
  id: serial("id").primaryKey(),
  heroTitle: text("hero_title").notNull().default("Welcome to Urban Bites"),
  heroSubtitle: text("hero_subtitle").notNull().default("Fresh, bold flavors crafted with love — burgers, coffee, and everything in between."),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  aboutTitle: text("about_title").notNull().default("Our Story"),
  aboutText: text("about_text").notNull().default("Urban Bites was born from a passion for honest food and great coffee. We believe every bite should tell a story."),
  aboutImageUrl: text("about_image_url").notNull().default(""),
  restaurantName: text("restaurant_name").notNull().default("Urban Bites"),
  restaurantTagline: text("restaurant_tagline").notNull().default("Fresh. Bold. Delicious."),
  logoUrl: text("logo_url").notNull().default(""),
  address: text("address").notNull().default("123 Main Street, Downtown, NY 10001"),
  phone: text("phone").notNull().default("+1 (555) 123-4567"),
  email: text("email").notNull().default("hello@urbanbites.com"),
  openingHours: text("opening_hours").notNull().default("Mon-Sun: 8:00 AM - 10:00 PM"),
  facebookUrl: text("facebook_url").default(""),
  instagramUrl: text("instagram_url").default(""),
  twitterUrl: text("twitter_url").default(""),
  footerText: text("footer_text").notNull().default("2024 Urban Bites. All rights reserved."),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteContentSchema = createInsertSchema(siteContentTable).omit({ id: true, updatedAt: true });
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContentTable.$inferSelect;
