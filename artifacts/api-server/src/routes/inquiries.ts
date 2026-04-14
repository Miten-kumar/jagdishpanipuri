import { Router } from "express";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/inquiries", async (req, res) => {
  try {
    const rows = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
    return res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching inquiries");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "name, email, subject, and message are required" });
    }
    const inserted = await db.insert(inquiriesTable).values({
      name,
      email,
      phone: phone ?? "",
      subject,
      message,
    }).returning();
    return res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error({ err }, "Error creating inquiry");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/inquiries/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting inquiry");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
