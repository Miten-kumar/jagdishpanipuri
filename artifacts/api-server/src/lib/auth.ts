import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "cafe-admin-secret-key-2024";

export function signToken(payload: { id: number; username: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    (req as Request & { user: typeof payload }).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return requireAuth(req, res, () => {
    const user = (req as Request & { user?: { role?: string } }).user;
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  });
}
