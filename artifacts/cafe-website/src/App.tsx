import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import MenuPage from "@/pages/MenuPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminContent from "@/pages/admin/AdminContent";
import AdminTheme from "@/pages/admin/AdminTheme";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={() => (
        <PublicLayout><HomePage /></PublicLayout>
      )} />
      <Route path="/about" component={() => (
        <PublicLayout><AboutPage /></PublicLayout>
      )} />
      <Route path="/menu" component={() => (
        <PublicLayout><MenuPage /></PublicLayout>
      )} />
      <Route path="/gallery" component={() => (
        <PublicLayout><GalleryPage /></PublicLayout>
      )} />
      <Route path="/contact" component={() => (
        <PublicLayout><ContactPage /></PublicLayout>
      )} />

      {/* Admin routes */}
      <Route path="/admin" component={() => (
        <AdminLayout><AdminDashboard /></AdminLayout>
      )} />
      <Route path="/admin/content" component={() => (
        <AdminLayout><AdminContent /></AdminLayout>
      )} />
      <Route path="/admin/theme" component={() => (
        <AdminLayout><AdminTheme /></AdminLayout>
      )} />
      <Route path="/admin/menu" component={() => (
        <AdminLayout><AdminMenu /></AdminLayout>
      )} />
      <Route path="/admin/gallery" component={() => (
        <AdminLayout><AdminGallery /></AdminLayout>
      )} />
      <Route path="/admin/inquiries" component={() => (
        <AdminLayout><AdminInquiries /></AdminLayout>
      )} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
