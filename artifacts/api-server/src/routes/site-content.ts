import { Router } from "express";
import { db } from "@workspace/db";
import { siteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/site-content", async (req, res) => {
  try {
    let rows = await db.select().from(siteContentTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(siteContentTable).values({}).returning();
      return res.json(inserted[0]);
    }
    return res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Error fetching site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/site-content", async (req, res) => {
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
    req.log.error({ err }, "Error updating site content");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
