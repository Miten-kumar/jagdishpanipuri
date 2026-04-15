import app from "./app";
import { logger } from "./lib/logger";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedDefaultAdmin() {
  try {
    const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, "mukesh@mailinator.com"));
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash("Mukesh@#!123", 12);
      await db.insert(adminUsersTable).values({
        username: "mukesh@mailinator.com",
        passwordHash,
        role: "superadmin",
      });
      logger.info("Default admin user created");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed default admin user");
  }
}

seedDefaultAdmin().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
