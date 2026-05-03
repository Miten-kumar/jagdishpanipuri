import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetSiteContent } from "@workspace/api-client-react";
import { apiPath } from "@/lib/api-base";

type PublicOrderStatus = "pending" | "accepted" | "preparing" | "ready" | string;

type TrackedOrder = {
  id: number;
  status: PublicOrderStatus;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{ name: string; quantity: number; price: string }>;
};

function statusLabel(status: PublicOrderStatus): string {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

function statusVariant(status: PublicOrderStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "preparing":
    case "accepted":
      return "secondary";
    case "pending":
      return "outline";
    default:
      return "outline";
  }
}

export default function TrackOrderPage({ initialOrderId }: { initialOrderId?: string }) {
  const [, setLocation] = useLocation();
  const { data: siteContent, isLoading: siteLoading } = useGetSiteContent();
  const trackingEnabled =
    (siteContent as unknown as { isOrderTrackingEnabled?: boolean })
      ?.isOrderTrackingEnabled ?? true;
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const normalizedOrderId = useMemo(() => {
    const value = (orderIdInput ?? "").trim();
    if (!value) return null;
    const id = Number(value);
    if (!Number.isFinite(id) || id <= 0) return null;
    return String(Math.trunc(id));
  }, [orderIdInput]);

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(apiPath(`/api/orders/${id}/track`));
      if (res.status === 404) {
        setError("Order not found (or it may have been cancelled).");
        return;
      }
      if (!res.ok) {
        setError("Failed to fetch order status.");
        return;
      }
      const data = (await res.json()) as TrackedOrder;
      setOrder(data);
    } catch {
      setError("Network error while fetching order status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!trackingEnabled) return;
    if (initialOrderId && initialOrderId.trim()) {
      void fetchOrder(initialOrderId.trim());
    }
  }, [fetchOrder, initialOrderId, trackingEnabled]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingEnabled) {
      setError("Order tracking is currently disabled.");
      return;
    }
    if (!normalizedOrderId) {
      setError("Please enter a valid order number.");
      return;
    }
    setLocation(`/track-order/${normalizedOrderId}`);
    await fetchOrder(normalizedOrderId);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Track Your Order</h1>
        <p className="text-muted-foreground mt-1">
          Enter your order number to see the latest status.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Number</CardTitle>
        </CardHeader>
        <CardContent>
          {siteLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !trackingEnabled ? (
            <p className="text-sm text-muted-foreground">
              Order tracking is currently disabled.
            </p>
          ) : (
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="orderId">Order #</Label>
              <Input
                id="orderId"
                inputMode="numeric"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. 123"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Track"}
            </Button>
          </form>
          )}
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      {order && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Order #{order.id}</span>
              <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Placed {new Date(order.createdAt).toLocaleString()}
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 text-sm font-medium text-foreground">
                Items
              </div>
              <div className="divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {item.quantity}</div>
                    </div>
                    <div className="text-sm text-foreground shrink-0">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{order.total}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
