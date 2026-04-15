import { Router } from "express";
import { db, branchesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/branches", async (req, res) => {
  try {
    const rows = await db.select().from(branchesTable).orderBy(asc(branchesTable.sortOrder));
    return res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching branches");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/branches", requireAuth, async (req, res) => {
  try {
    const { name, address, phone, email, openingHours, mapUrl, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const [branch] = await db.insert(branchesTable).values({
      name,
      address: address ?? "",
      phone: phone ?? "",
      email: email ?? "",
      openingHours: openingHours ?? "",
      mapUrl: mapUrl ?? "",
      sortOrder: sortOrder ?? 0,
    }).returning();
    return res.status(201).json(branch);
  } catch (err) {
    req.log.error({ err }, "Error creating branch");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/branches/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, address, phone, email, openingHours, mapUrl, sortOrder } = req.body;
    const [branch] = await db.update(branchesTable).set({
      ...(name && { name }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(openingHours !== undefined && { openingHours }),
      ...(mapUrl !== undefined && { mapUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
    }).where(eq(branchesTable.id, id)).returning();
    if (!branch) return res.status(404).json({ error: "Branch not found" });
    return res.json(branch);
  } catch (err) {
    req.log.error({ err }, "Error updating branch");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/branches/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(branchesTable).where(eq(branchesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting branch");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
