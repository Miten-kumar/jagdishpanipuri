import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Edit2, Check, Trash2, X, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGetSiteContent } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface OrderItem { id?: number; menuItemId: number; name: string; price: number | string; quantity: number; notes?: string; }
interface Order { id: number; customerName: string; customerEmail: string; customerPhone: string; tableNumber: string; status: string; notes: string; total: string; createdAt: string; items: OrderItem[]; }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function BillModal({ order, siteContent, onClose }: { order: Order; siteContent: { restaurantName: string; logoUrl: string; address: string; phone: string } | undefined; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    if (!win || !content) return;
    win.document.write(`<html><head><title>Bill #${order.id}</title><style>body{font-family:serif;padding:30px;max-width:400px;margin:0 auto;}h1{font-size:22px;text-align:center;}h2{font-size:16px;}table{width:100%;border-collapse:collapse;}td{padding:4px 0;}hr{border:1px dashed #ccc;margin:10px 0;}.right{text-align:right;}.total{font-weight:bold;font-size:16px;}.center{text-align:center;}.small{font-size:12px;color:#666;}</style></head><body>${content}<script>window.print();window.close();</script></body></html>`);
    win.document.close();
  };
  const items = order.items ?? [];
  const total = items.reduce((s, i) => s + parseFloat(String(i.price)) * i.quantity, 0);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">Digital Bill — Order #{order.id}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div ref={printRef} className="p-5 font-mono text-sm">
          <h1 className="text-center text-xl font-bold mb-0.5">{siteContent?.restaurantName ?? "Restaurant"}</h1>
          {siteContent?.logoUrl && <img src={siteContent.logoUrl} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-2" />}
          <p className="text-center text-xs text-muted-foreground mb-1">{siteContent?.address}</p>
          <p className="text-center text-xs text-muted-foreground mb-3">{siteContent?.phone}</p>
          <hr className="border-dashed border-border" />
          <div className="my-2 space-y-0.5 text-xs">
            <div className="flex justify-between"><span>Order #</span><span>{order.id}</span></div>
            <div className="flex justify-between"><span>Date</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span>Time</span><span>{new Date(order.createdAt).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span>Customer</span><span>{order.customerName}</span></div>
            {order.tableNumber && <div className="flex justify-between"><span>Table</span><span>{order.tableNumber}</span></div>}
          </div>
          <hr className="border-dashed border-border" />
          <div className="my-2 space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{item.quantity}× {item.name}</span>
                <span>${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="border-dashed border-border" />
          <div className="flex justify-between font-bold text-base my-2">
            <span>TOTAL</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <hr className="border-dashed border-border" />
          <p className="text-center text-xs text-muted-foreground mt-3">Thank you for dining with us!</p>
          <p className="text-center text-xs text-muted-foreground">Please visit again.</p>
        </div>
        <div className="p-4 border-t border-border">
          <Button className="w-full gap-2" onClick={handlePrint}><Printer className="w-4 h-4" />Print Bill</Button>
        </div>
      </div>
    </div>
  );
}

function OrderFormModal({ order, onClose, onSaved }: { order?: Order | null; onClose: () => void; onSaved: () => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: order?.customerName ?? "", customerEmail: order?.customerEmail ?? "", customerPhone: order?.customerPhone ?? "", tableNumber: order?.tableNumber ?? "", status: order?.status ?? "pending", notes: order?.notes ?? "" });
  const [items, setItems] = useState<{ name: string; price: string; quantity: number }[]>(
    order?.items?.map((i) => ({ name: i.name, price: String(i.price), quantity: i.quantity })) ?? [{ name: "", price: "", quantity: 1 }]
  );
  const addItem = () => setItems([...items, { name: "", price: "", quantity: 1 }]);
  const removeItemRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItemRow = (idx: number, field: string, value: string | number) => setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const validItems = items.filter((i) => i.name && i.price);
    if (!form.customerName || validItems.length === 0) { toast({ title: "Customer name and at least one item required", variant: "destructive" }); setSaving(false); return; }
    try {
      const url = order ? `${BASE}/api/orders/${order.id}` : `${BASE}/api/orders`;
      const method = order ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", ...(order ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ...form, items: validItems.map((i) => ({ menuItemId: 0, name: i.name, price: parseFloat(i.price), quantity: i.quantity, notes: "" })) }) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: order ? "Order updated" : "Order created" });
      onSaved();
    } catch { toast({ title: "Error saving order", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">{order ? "Edit Order" : "New Order"}</h3>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Customer Name *</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Full name" required /></div>
            <div className="space-y-1"><Label>Table #</Label><Input value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} placeholder="Table 5" /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="email@example.com" /></div>
            <div className="space-y-1"><Label>Phone</Label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="+1 555 000 0000" /></div>
          </div>
          {order && (
            <div className="space-y-1">
              <Label>Status</Label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {["pending","preparing","ready","accepted","cancelled"].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Special requests..." rows={2} /></div>
          <div>
            <div className="flex items-center justify-between mb-2"><Label>Order Items *</Label><Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" />Add Item</Button></div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input className="flex-1" placeholder="Item name" value={item.name} onChange={(e) => updateItemRow(idx, "name", e.target.value)} />
                  <Input className="w-20" placeholder="Price" value={item.price} onChange={(e) => updateItemRow(idx, "price", e.target.value)} />
                  <Input className="w-16" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={(e) => updateItemRow(idx, "quantity", parseInt(e.target.value) || 1)} />
                  {items.length > 1 && <button type="button" onClick={() => removeItemRow(idx)} className="text-destructive"><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save Order"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: siteContent } = useGetSiteContent();
  const [editOrder, setEditOrder] = useState<Order | null | undefined>(undefined);
  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/orders/${id}/accept`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data: Order) => { queryClient.invalidateQueries({ queryKey: ["orders"] }); setBillOrder(data); toast({ title: "Order accepted! Bill generated." }); },
    onError: () => toast({ title: "Failed to accept order", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`${BASE}/api/orders/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); toast({ title: "Order deleted" }); },
  });

  const filtered = filter === "all" ? orders : orders?.filter((o) => o.status === filter);

  return (
    <div>
      {billOrder && <BillModal order={billOrder} siteContent={siteContent as Order["items"][0] extends never ? never : typeof siteContent} onClose={() => setBillOrder(null)} />}
      {editOrder !== undefined && (
        <OrderFormModal
          order={editOrder}
          onClose={() => setEditOrder(undefined)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["orders"] }); setEditOrder(undefined); }}
        />
      )}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and accept customer orders from the menu.</p>
        </div>
        <Button onClick={() => setEditOrder(null)} className="gap-2 shrink-0"><Plus className="w-4 h-4" />New Order</Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["all","pending","preparing","ready","accepted","cancelled"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No orders yet. Customers can order from the menu page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold text-foreground">Order #{order.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>{order.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{order.customerName}{order.tableNumber ? ` — Table ${order.tableNumber}` : ""}</p>
                      {order.customerEmail && <p className="text-xs text-muted-foreground">{order.customerEmail}{order.customerPhone ? ` · ${order.customerPhone}` : ""}</p>}
                      <div className="mt-2 space-y-0.5">
                        {order.items?.map((item, j) => (
                          <p key={j} className="text-xs text-muted-foreground">{item.quantity}× {item.name} — ${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}</p>
                        ))}
                      </div>
                      {order.notes && <p className="text-xs text-muted-foreground mt-1 italic">Note: {order.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-lg font-bold text-primary">${parseFloat(order.total).toFixed(2)}</span>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {order.status !== "accepted" && order.status !== "cancelled" && (
                          <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => acceptMutation.mutate(order.id)}><Check className="w-3.5 h-3.5" />Accept</Button>
                        )}
                        {order.status === "accepted" && (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setBillOrder(order)}><Printer className="w-3.5 h-3.5" />Bill</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setEditOrder(order)}><Edit2 className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Delete this order?")) deleteMutation.mutate(order.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
