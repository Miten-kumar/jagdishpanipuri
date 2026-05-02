import { Router } from "express";
import { db, ordersTable, orderItemsTable, siteContentTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { addOrderStatusBoardClient, broadcastOrderStatusBoardRefresh } from "../lib/order-status-board-sse";

const router = Router();

router.get("/orders", requireAuth, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const orderIds = orders.map((o) => o.id);
    let items: typeof orderItemsTable.$inferSelect[] = [];
    if (orderIds.length > 0) {
      const allItems = await db.select().from(orderItemsTable);
      items = allItems.filter((i) => orderIds.includes(i.orderId));
    }
    const result = orders.map((order) => ({
      ...order,
      items: items.filter((i) => i.orderId === order.id),
    }));
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error fetching orders");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  const [siteContent] = await db.select().from(siteContentTable).limit(1);
  if (siteContent && siteContent.isOrderingEnabled === false) {
    return res.status(403).json({ error: "Ordering is currently disabled" });
  }
  try {
    const { customerName, customerEmail, customerPhone, tableNumber, notes, items } = req.body;
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "customerName and items are required" });
    }
    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const [order] = await db.insert(ordersTable).values({
      customerName,
      customerEmail: customerEmail ?? "",
      customerPhone: customerPhone ?? "",
      tableNumber: tableNumber ?? "",
      notes: notes ?? "",
      status: "pending",
      total: total.toFixed(2),
    }).returning();
    const orderItems = await db.insert(orderItemsTable).values(
      items.map((item: { menuItemId: number; name: string; price: number; quantity: number; notes?: string }) => ({
        orderId: order.id,
        menuItemId: item.menuItemId ?? 0,
        name: item.name,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        notes: item.notes ?? "",
      }))
    ).returning();
    return res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    req.log.error({ err }, "Error creating order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id/track", async (req, res) => {
  try {
    const [siteContent] = await db.select().from(siteContentTable).limit(1);
    if (siteContent && siteContent.isOrderTrackingEnabled === false) {
      return res.status(404).json({ error: "Not found" });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Do not expose rejected/cancelled orders on the public tracking page.
    // (DB status currently uses "cancelled"; "rejected" is treated the same if introduced later.)
    if (order.status === "cancelled" || order.status === "rejected") {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    return res.json({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  } catch (err) {
    const e = err as { message?: string; cause?: { message?: string } };
    const msg = e?.cause?.message ?? e?.message ?? "";
    if (msg.includes("is_order_tracking_enabled") || msg.includes("is_public_order_status_board_enabled")) {
      return res.status(500).json({
        error: "Database schema is out of date. Run: pnpm --filter @workspace/db run push",
      });
    }
    req.log.error({ err }, "Error fetching public order status");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/public-status", async (req, res) => {
  try {
    const [siteContent] = await db.select().from(siteContentTable).limit(1);
    if (!siteContent || siteContent.isPublicOrderStatusBoardEnabled === false) {
      return res.status(404).json({ error: "Not found" });
    }

    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.updatedAt));
    const filtered = rows.filter((o) => o.status === "preparing" || o.status === "ready");

    return res.json(
      filtered.map((o) => ({
        id: o.id,
        status: o.status,
        updatedAt: o.updatedAt,
      })),
    );
  } catch (err) {
    const e = err as { message?: string; cause?: { message?: string } };
    const msg = e?.cause?.message ?? e?.message ?? "";
    if (msg.includes("is_order_tracking_enabled") || msg.includes("is_public_order_status_board_enabled")) {
      return res.status(500).json({
        error: "Database schema is out of date. Run: pnpm --filter @workspace/db run push",
      });
    }
    req.log.error({ err }, "Error fetching public order list");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/public-status/stream", async (req, res) => {
  try {
    const [siteContent] = await db.select().from(siteContentTable).limit(1);
    if (!siteContent || siteContent.isPublicOrderStatusBoardEnabled === false) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const cleanup = addOrderStatusBoardClient(res);
    req.on("close", () => cleanup());
    return;
  } catch (err) {
    const e = err as { message?: string; cause?: { message?: string } };
    const msg = e?.cause?.message ?? e?.message ?? "";
    if (msg.includes("is_order_tracking_enabled") || msg.includes("is_public_order_status_board_enabled")) {
      return res.status(500).json({
        error: "Database schema is out of date. Run: pnpm --filter @workspace/db run push",
      });
    }
    req.log.error({ err }, "Error opening order board stream");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/orders/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { customerName, customerEmail, customerPhone, tableNumber, status, notes, items } = req.body;
    const [order] = await db.update(ordersTable).set({
      ...(customerName && { customerName }),
      ...(customerEmail !== undefined && { customerEmail }),
      ...(customerPhone !== undefined && { customerPhone }),
      ...(tableNumber !== undefined && { tableNumber }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (items && Array.isArray(items)) {
      await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
      await db.update(ordersTable).set({ total: total.toFixed(2) }).where(eq(ordersTable.id, id));
      const orderItems = await db.insert(orderItemsTable).values(
        items.map((item: { menuItemId: number; name: string; price: number; quantity: number; notes?: string }) => ({
          orderId: id,
          menuItemId: item.menuItemId ?? 0,
          name: item.name,
          price: item.price.toFixed(2),
          quantity: item.quantity,
          notes: item.notes ?? "",
        }))
      ).returning();
      const allItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      broadcastOrderStatusBoardRefresh();
      return res.json({ ...order, items: allItems });
    }
    const allItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    broadcastOrderStatusBoardRefresh();
    return res.json({ ...order, items: allItems });
  } catch (err) {
    req.log.error({ err }, "Error updating order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id/accept", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db.update(ordersTable).set({ status: "accepted", updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Order not found" });
    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    broadcastOrderStatusBoardRefresh();
    return res.json({ ...order, items });
  } catch (err) {
    req.log.error({ err }, "Error accepting order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/orders/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting order");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
