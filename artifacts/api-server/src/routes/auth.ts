import { Router } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../lib/auth";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    const users = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({ id: user.id, username: user.username, role: user.role });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    req.log.error({ err }, "Error in login");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (req as any).user;
  return res.json(user);
});

export default router;
