import { Router } from "express";
import { db } from "@workspace/db";
import { menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/menu-categories", async (req, res) => {
  try {
    const rows = await db.select().from(menuCategoriesTable).orderBy(asc(menuCategoriesTable.sortOrder));
    return res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching menu categories");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/menu-categories", async (req, res) => {
  try {
    const { name, description, iconName, sortOrder } = req.body;
    const inserted = await db.insert(menuCategoriesTable).values({
      name,
      description: description ?? "",
      iconName: iconName ?? "Utensils",
      sortOrder: sortOrder ?? 0,
    }).returning();
    return res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Error creating menu category");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/menu-categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, iconName, sortOrder } = req.body;
    const updated = await db.update(menuCategoriesTable)
      .set({ name, description, iconName, sortOrder })
      .where(eq(menuCategoriesTable.id, id))
      .returning();
    if (updated.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Error updating menu category");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/menu-categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(menuCategoriesTable).where(eq(menuCategoriesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting menu category");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/menu-items", async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    let query = db.select().from(menuItemsTable).orderBy(asc(menuItemsTable.sortOrder));
    if (categoryId) {
      const rows = await db.select().from(menuItemsTable)
        .where(eq(menuItemsTable.categoryId, categoryId))
        .orderBy(asc(menuItemsTable.sortOrder));
      return res.json(rows);
    }
    const rows = await query;
    return res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching menu items");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/menu-items", async (req, res) => {
  try {
    const { categoryId, name, description, price, imageUrl, isAvailable, isFeatured, tags, sortOrder } = req.body;
    const inserted = await db.insert(menuItemsTable).values({
      categoryId,
      name,
      description: description ?? "",
      price,
      imageUrl: imageUrl ?? "",
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
      tags: tags ?? "",
      sortOrder: sortOrder ?? 0,
    }).returning();
    return res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Error creating menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/menu-items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { categoryId, name, description, price, imageUrl, isAvailable, isFeatured, tags, sortOrder } = req.body;
    const updated = await db.update(menuItemsTable)
      .set({ categoryId, name, description, price, imageUrl, isAvailable, isFeatured, tags, sortOrder })
      .where(eq(menuItemsTable.id, id))
      .returning();
    if (updated.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(updated[0]);
  } catch (err) {
    req.log.error({ err }, "Error updating menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/menu-items/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting menu item");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
