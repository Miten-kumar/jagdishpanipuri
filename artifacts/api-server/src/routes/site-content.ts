import { Router } from "express";
import { db } from "@workspace/db";
import { siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireSuperAdmin } from "../lib/auth";

const router = Router();

function schemaOutOfDateMessage(err: unknown): string | null {
  const e = err as { message?: string; code?: string; cause?: { code?: string; message?: string } };
  const msg = e?.cause?.message ?? e?.message ?? "";
  const code = e?.cause?.code ?? e?.code;
  if (code !== "42703" && !msg.includes("does not exist")) return null;
  if (
    msg.includes("is_order_tracking_enabled") ||
    msg.includes("is_public_order_status_board_enabled")
  ) {
    return "Database schema is out of date. Run: pnpm --filter @workspace/db run push";
  }
  return null;
}

router.get("/site-content", async (req, res) => {
  try {
    let rows = await db.select().from(siteContentTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(siteContentTable).values({}).returning();
      return res.json(inserted[0]);
    }
    return res.json(rows[0]);
  } catch (err) {
    const hint = schemaOutOfDateMessage(err);
    if (hint) return res.status(500).json({ error: hint });
    req.log.error({ err }, "Error fetching site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/site-content", requireSuperAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(siteContentTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(siteContentTable).values({ ...req.body, updatedAt: new Date() }).returning();
      return res.json(inserted[0]);
    }
    const updated = await db.update(siteContentTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(siteContentTable.id, rows[0].id))
      .returning();
    return res.json(updated[0]);
  } catch (err) {
    const hint = schemaOutOfDateMessage(err);
    if (hint) return res.status(500).json({ error: hint });
    req.log.error({ err }, "Error updating site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/site-content/public-pages", requireAuth, async (req, res) => {
  try {
    const { isOrderTrackingEnabled, isPublicOrderStatusBoardEnabled } =
      req.body ?? {};

    const updates: Record<string, unknown> = {};
    if (typeof isOrderTrackingEnabled === "boolean") {
      updates.isOrderTrackingEnabled = isOrderTrackingEnabled;
    }
    if (typeof isPublicOrderStatusBoardEnabled === "boolean") {
      updates.isPublicOrderStatusBoardEnabled = isPublicOrderStatusBoardEnabled;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    const rows = await db.select().from(siteContentTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db
        .insert(siteContentTable)
        .values({ ...updates, updatedAt: new Date() })
        .returning();
      return res.json(inserted[0]);
    }

    const updated = await db
      .update(siteContentTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteContentTable.id, rows[0].id))
      .returning();
    return res.json(updated[0]);
  } catch (err) {
    const hint = schemaOutOfDateMessage(err);
    if (hint) return res.status(500).json({ error: hint });
    req.log.error({ err }, "Error updating public pages settings");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
