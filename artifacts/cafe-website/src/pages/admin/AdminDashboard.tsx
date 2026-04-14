import { Link } from "wouter";
import { UtensilsCrossed, Image, MessageSquare, FileText, Palette, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGetMenuItems, useGetGalleryImages, useGetInquiries, useGetMenuCategories } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: menuItems } = useGetMenuItems();
  const { data: galleryImages } = useGetGalleryImages();
  const { data: inquiries } = useGetInquiries();
  const { data: categories } = useGetMenuCategories();

  const unreadInquiries = inquiries?.filter((i) => !i.isRead).length ?? 0;

  const stats = [
    { label: "Menu Items", value: menuItems?.length ?? 0, icon: UtensilsCrossed, href: "/admin/menu", color: "text-amber-600" },
    { label: "Categories", value: categories?.length ?? 0, icon: FileText, href: "/admin/menu", color: "text-orange-600" },
    { label: "Gallery Images", value: galleryImages?.length ?? 0, icon: Image, href: "/admin/gallery", color: "text-blue-600" },
    { label: "Inquiries", value: inquiries?.length ?? 0, icon: MessageSquare, href: "/admin/inquiries", color: "text-green-600", badge: unreadInquiries > 0 ? unreadInquiries : undefined },
  ];

  const quickActions = [
    { label: "Edit Site Content", desc: "Update text, images, contact info", href: "/admin/content", icon: FileText },
    { label: "Change Theme Color", desc: "Customize the site's color palette", href: "/admin/theme", icon: Palette },
    { label: "Manage Menu", desc: "Add, edit, delete menu items", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Manage Gallery", desc: "Upload and organize gallery photos", href: "/admin/gallery", icon: Image },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's what's happening with your site.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}>
            <Link href={stat.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {stat.label}
                    {stat.badge && <Badge variant="destructive" className="text-xs">{stat.badge} new</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    <stat.icon className={`w-6 h-6 ${stat.color} opacity-70`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}>
              <Link href={action.href}>
                <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all" data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Inquiries */}
      {inquiries && inquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Inquiries</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/inquiries">View All</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {inquiries.slice(0, 3).map((inq) => (
                  <div key={inq.id} className="p-4 flex items-start justify-between gap-4" data-testid={`inquiry-row-${inq.id}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-foreground text-sm">{inq.name}</span>
                        {!inq.isRead && <Badge variant="secondary" className="text-xs">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{inq.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{inq.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
