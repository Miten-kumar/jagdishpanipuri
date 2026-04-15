import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, MessageSquare, ShoppingBag, Monitor } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16"];

interface Analytics {
  inquiriesByMonth: { month: string; count: number }[];
  ordersByMonth: { month: string; count: number }[];
  topMenuItems: { name: string; count: number }[];
  uniqueDevicesByDay: { day: string; count: number }[];
  totals: { inquiries: number; orders: number; pageViews: number; uniqueDevices: number };
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalytics() {
  const { token } = useAuth();
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics...</div>;

  const totals = data?.totals;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track performance, orders, and visitor activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MessageSquare} label="Total Inquiries" value={totals?.inquiries ?? 0} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totals?.orders ?? 0} color="bg-amber-500" />
        <StatCard icon={Monitor} label="Page Views" value={totals?.pageViews ?? 0} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label="Unique Devices" value={totals?.uniqueDevices ?? 0} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Inquiries by Month</CardTitle></CardHeader>
          <CardContent>
            {!data?.inquiriesByMonth.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No inquiry data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.inquiriesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Orders Growth by Month</CardTitle></CardHeader>
          <CardContent>
            {!data?.ordersByMonth.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No order data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Most Ordered Menu Items</CardTitle></CardHeader>
          <CardContent>
            {!data?.topMenuItems.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No order item data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.topMenuItems} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10}>
                    {data.topMenuItems.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Unique Devices by Day</CardTitle></CardHeader>
          <CardContent>
            {!data?.uniqueDevicesByDay.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">No visitor data yet. Visitors will appear here as customers browse the site.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.uniqueDevicesByDay.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Unique Devices" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
