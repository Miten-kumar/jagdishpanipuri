import { Router } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "../lib/auth";

const router = Router();

router.get("/admin-users", requireSuperAdmin, async (req, res) => {
  try {
    const users = await db.select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      role: adminUsersTable.role,
      createdAt: adminUsersTable.createdAt,
    }).from(adminUsersTable);
    return res.json(users);
  } catch (err) {
    req.log.error({ err }, "Error fetching admin users");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin-users", requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(adminUsersTable).values({
      username,
      passwordHash,
      role: role ?? "admin",
    }).returning({ id: adminUsersTable.id, username: adminUsersTable.username, role: adminUsersTable.role, createdAt: adminUsersTable.createdAt });
    return res.status(201).json(user);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return res.status(409).json({ error: "Username already exists" });
    }
    req.log.error({ err }, "Error creating admin user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin-users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, password, role } = req.body;
    const updates: Record<string, unknown> = {};
    if (username) updates.username = username;
    if (role) updates.role = role;
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.update(adminUsersTable).set(updates).where(eq(adminUsersTable.id, id))
      .returning({ id: adminUsersTable.id, username: adminUsersTable.username, role: adminUsersTable.role, createdAt: adminUsersTable.createdAt });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error updating admin user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin-users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting admin user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
