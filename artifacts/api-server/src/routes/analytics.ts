import { Router } from "express";
import { db, inquiriesTable, ordersTable, orderItemsTable, pageViewsTable } from "@workspace/db";
import { desc, sql, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/analytics", requireAuth, async (req, res) => {
  try {
    const inquiries = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const orderItems = await db.select().from(orderItemsTable);
    const pageViews = await db.select().from(pageViewsTable).orderBy(desc(pageViewsTable.createdAt));

    const inquiriesByMonth = groupByMonth(inquiries.map((i) => i.createdAt));
    const ordersByMonth = groupByMonth(orders.map((o) => o.createdAt));

    const itemCounts: Record<string, { name: string; count: number }> = {};
    for (const item of orderItems) {
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, count: 0 };
      itemCounts[item.name].count += item.quantity;
    }
    const topMenuItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 10);

    const uniqueDevicesByDay = groupUniqueByDay(pageViews.map((p) => ({ date: p.createdAt, id: p.deviceId })));

    return res.json({
      inquiriesByMonth,
      ordersByMonth,
      topMenuItems,
      uniqueDevicesByDay,
      totals: {
        inquiries: inquiries.length,
        orders: orders.length,
        pageViews: pageViews.length,
        uniqueDevices: new Set(pageViews.map((p) => p.deviceId).filter(Boolean)).size,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching analytics");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/track", async (req, res) => {
  try {
    const { path, deviceId } = req.body;
    if (!path) return res.status(400).json({ error: "path is required" });
    await db.insert(pageViewsTable).values({ path: path ?? "/", deviceId: deviceId ?? "" });
    return res.status(201).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error tracking page view");
    return res.status(500).json({ error: "Internal server error" });
  }
});

function groupByMonth(dates: Date[]) {
  const map: Record<string, number> = {};
  for (const d of dates) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
}

function groupUniqueByDay(entries: { date: Date; id: string }[]) {
  const map: Record<string, Set<string>> = {};
  for (const e of entries) {
    const key = e.date.toISOString().slice(0, 10);
    if (!map[key]) map[key] = new Set();
    if (e.id) map[key].add(e.id);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([day, ids]) => ({ day, count: ids.size }));
}

export default router;
