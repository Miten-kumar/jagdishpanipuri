import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import MenuPage from "@/pages/MenuPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import OrderStatusBoardPage from "@/pages/OrderStatusBoardPage";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminContent from "@/pages/admin/AdminContent";
import AdminTheme from "@/pages/admin/AdminTheme";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminBranches from "@/pages/admin/AdminBranches";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function PageTracker() {
  const [location] = useLocation();
  useEffect(() => {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) { deviceId = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("device_id", deviceId); }
    fetch(`${BASE}/api/track`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: location, deviceId }) }).catch(() => {});
  }, [location]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => { if (!isLoading && !user) setLocation("/admin/login"); }, [user, isLoading, setLocation]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) setLocation("/admin");
  }, [user, isLoading, setLocation]);
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;
  if (user.role !== "superadmin") return null;
  return <>{children}</>;
}

function Router() {
  return (
    <>
      <PageTracker />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={() => <PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" component={() => <PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/menu" component={() => <PublicLayout><MenuPage /></PublicLayout>} />
        <Route path="/gallery" component={() => <PublicLayout><GalleryPage /></PublicLayout>} />
        <Route path="/contact" component={() => <PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/track-order" component={() => <PublicLayout><TrackOrderPage /></PublicLayout>} />
        <Route path="/track-order/:id" component={(params) => <PublicLayout><TrackOrderPage initialOrderId={params.id} /></PublicLayout>} />
        <Route path="/order-status" component={() => <PublicLayout><OrderStatusBoardPage /></PublicLayout>} />

        {/* Auth */}
        <Route path="/admin/login" component={LoginPage} />

        {/* Admin routes */}
        <Route path="/admin" component={() => <ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/content" component={() => <ProtectedRoute><SuperAdminRoute><AdminLayout><AdminContent /></AdminLayout></SuperAdminRoute></ProtectedRoute>} />
        <Route path="/admin/theme" component={() => <ProtectedRoute><SuperAdminRoute><AdminLayout><AdminTheme /></AdminLayout></SuperAdminRoute></ProtectedRoute>} />
        <Route path="/admin/menu" component={() => <ProtectedRoute><AdminLayout><AdminMenu /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/gallery" component={() => <ProtectedRoute><AdminLayout><AdminGallery /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/inquiries" component={() => <ProtectedRoute><AdminLayout><AdminInquiries /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders" component={() => <ProtectedRoute><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/analytics" component={() => <ProtectedRoute><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" component={() => <ProtectedRoute><SuperAdminRoute><AdminLayout><AdminUsers /></AdminLayout></SuperAdminRoute></ProtectedRoute>} />
        <Route path="/admin/branches" component={() => <ProtectedRoute><AdminLayout><AdminBranches /></AdminLayout></ProtectedRoute>} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
