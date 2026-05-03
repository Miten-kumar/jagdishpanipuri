import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSiteContent } from "@workspace/api-client-react";
import { apiPath } from "@/lib/api-base";

type BoardRow = { id: number; status: string; updatedAt: string };

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "preparing":
      return "secondary";
    default:
      return "outline";
  }
}

export default function OrderStatusBoardPage() {
  const { data: siteContent, isLoading: siteLoading } = useGetSiteContent();
  const boardEnabled =
    (siteContent as unknown as { isPublicOrderStatusBoardEnabled?: boolean })
      ?.isPublicOrderStatusBoardEnabled ?? false;

  const [rows, setRows] = useState<BoardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiPath("/api/orders/public-status"));
      if (res.status === 404) {
        setRows([]);
        setError("This page is currently disabled.");
        return;
      }
      if (!res.ok) {
        setError("Failed to load orders.");
        return;
      }
      const data = (await res.json()) as BoardRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Network error while loading orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!boardEnabled) return;
    setConnected(false);
    void fetchBoard();

    const stream = new EventSource(apiPath("/api/orders/public-status/stream"));

    const handleConnected = () => {
      setConnected(true);
      setError(null);
    };
    const handleRefresh = () => void fetchBoard();
    const handleError = () => {
      setConnected(false);
      // EventSource auto-reconnects; keep UI calm.
      setError("Live updates disconnected. Retrying...");
    };

    stream.addEventListener("connected", handleConnected);
    stream.addEventListener("refresh", handleRefresh);
    stream.onerror = handleError;

    return () => {
      stream.close();
    };
  }, [boardEnabled, fetchBoard]);

  if (siteLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!boardEnabled) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This page is currently disabled.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Order Status</h1>
        <p className="text-muted-foreground mt-1">
          Showing orders that are preparing or ready.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Live Board</span>
            <span className="text-xs text-muted-foreground">
              {loading
                ? "Refreshing..."
                : connected
                  ? "Live"
                  : "Connecting..."}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders right now.</p>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {rows.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="font-medium text-foreground">Order #{r.id}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.updatedAt).toLocaleTimeString()}
                    </span>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
