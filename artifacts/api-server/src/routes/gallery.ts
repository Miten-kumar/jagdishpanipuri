import { Router } from "express";
import { db } from "@workspace/db";
import { galleryImagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/gallery-images", async (req, res) => {
  try {
    const rows = await db.select().from(galleryImagesTable).orderBy(asc(galleryImagesTable.sortOrder));
    return res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching gallery images");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/gallery-images", async (req, res) => {
  try {
    const { imageUrl, caption, altText, sortOrder } = req.body;
    const inserted = await db.insert(galleryImagesTable).values({
      imageUrl,
      caption: caption ?? "",
      altText: altText ?? "",
      sortOrder: sortOrder ?? 0,
    }).returning();
    return res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Error creating gallery image");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/gallery-images/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { imageUrl, caption, altText, sortOrder } = req.body;
    const updated = await db.update(galleryImagesTable)
      .set({ imageUrl, caption, altText, sortOrder })
      .where(eq(galleryImagesTable.id, id))
      .returning();
    if (updated.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Error updating gallery image");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/gallery-images/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(galleryImagesTable).where(eq(galleryImagesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting gallery image");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
