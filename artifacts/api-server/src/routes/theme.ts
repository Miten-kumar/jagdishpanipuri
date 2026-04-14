import { Router } from "express";
import { db } from "@workspace/db";
import { themeSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/theme", async (req, res) => {
  try {
    let rows = await db.select().from(themeSettingsTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(themeSettingsTable).values({}).returning();
      return res.json(inserted[0]);
    }
    return res.json(rows[0]);
  } catch (err) {
    req.log.error({ err }, "Error fetching theme");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/theme", async (req, res) => {
  try {
    const rows = await db.select().from(themeSettingsTable).limit(1);
    if (rows.length === 0) {
      const inserted = await db.insert(themeSettingsTable).values({ ...req.body, updatedAt: new Date() }).returning();
      return res.json(inserted[0]);
    }
    const updated = await db.update(themeSettingsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(themeSettingsTable.id, rows[0].id))
      .returning();
    return res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Error updating theme");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
