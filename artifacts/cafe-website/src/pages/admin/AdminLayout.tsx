import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Palette,
  UtensilsCrossed,
  Image,
  MessageSquare,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  BarChart2,
  Users,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Customer Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Site Content", href: "/admin/content", icon: FileText },
  { label: "Branch Locations", href: "/admin/branches", icon: MapPin },
  { label: "Theme Color", href: "/admin/theme", icon: Palette },
  { label: "Menu Manager", href: "/admin/menu", icon: UtensilsCrossed },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Manage Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="font-bold text-foreground text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                JCPC Bites
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admin Panel
              </p>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1.5">
          {user && (
            <p className="text-xs text-muted-foreground px-3 truncate">
              {user.username}
            </p>
          )}
          <Link href="/" data-testid="admin-link-site">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              View Public Site
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-admin-sidebar-toggle"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="font-semibold text-foreground text-sm">
              {navItems.find((n) => n.href === location)?.label ?? "Admin"}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Urban Bites Admin
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
