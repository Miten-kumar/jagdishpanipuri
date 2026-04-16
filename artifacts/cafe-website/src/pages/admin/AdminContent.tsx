import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetSiteContent,
  useUpdateSiteContent,
  getGetSiteContentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", name: "US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "Euro (€)" },
  { code: "GBP", symbol: "£", name: "British Pound (£)" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham (د.إ)" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar (S$)" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar (A$)" },
];

const contentSchema = z.object({
  restaurantName: z.string().min(1, "Required"),
  restaurantTagline: z.string().min(1, "Required"),
  logoUrl: z.string().optional(),
  heroTitle: z.string().min(1, "Required"),
  heroSubtitle: z.string().min(1, "Required"),
  heroImageUrl: z.string().optional(),
  aboutTitle: z.string().min(1, "Required"),
  aboutText: z.string().min(1, "Required"),
  aboutImageUrl: z.string().optional(),
  address: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  openingHours: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  mapEmbedUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  footerText: z.string().min(1, "Required"),
  isOrderingEnabled: z.boolean(),
});

type ContentForm = z.infer<typeof contentSchema>;

export default function AdminContent() {
  const { data: siteContent, isLoading } = useGetSiteContent();
  const updateContent = useUpdateSiteContent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      restaurantName: "",
      restaurantTagline: "",
      logoUrl: "",
      heroTitle: "",
      heroSubtitle: "",
      heroImageUrl: "",
      aboutTitle: "",
      aboutText: "",
      aboutImageUrl: "",
      address: "",
      phone: "",
      email: "",
      openingHours: "",
      currency: "INR",
      mapEmbedUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      footerText: "",
      isOrderingEnabled: false,
    },
  });

  useEffect(() => {
    if (siteContent) {
      form.reset({
        restaurantName: siteContent.restaurantName ?? "",
        restaurantTagline: siteContent.restaurantTagline ?? "",
        logoUrl: siteContent.logoUrl ?? "",
        heroTitle: siteContent.heroTitle ?? "",
        heroSubtitle: siteContent.heroSubtitle ?? "",
        heroImageUrl: siteContent.heroImageUrl ?? "",
        aboutTitle: siteContent.aboutTitle ?? "",
        aboutText: siteContent.aboutText ?? "",
        aboutImageUrl: siteContent.aboutImageUrl ?? "",
        address: siteContent.address ?? "",
        phone: siteContent.phone ?? "",
        email: siteContent.email ?? "",
        openingHours: siteContent.openingHours ?? "",
        currency: siteContent.currency ?? "INR",
        mapEmbedUrl: siteContent.mapEmbedUrl ?? "",
        facebookUrl: siteContent.facebookUrl ?? "",
        instagramUrl: siteContent.instagramUrl ?? "",
        twitterUrl: siteContent.twitterUrl ?? "",
        footerText: siteContent.footerText ?? "",
        isOrderingEnabled: siteContent.isOrderingEnabled ?? false,
      });
    }
  }, [siteContent, form]);

  const onSubmit = (data: ContentForm) => {
    updateContent.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetSiteContentQueryKey(),
          });
          toast({
            title: "Saved!",
            description: "Site content updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save content.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site Content</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Edit all text and images across your website.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand Identity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "restaurantName" as const,
                    label: "Restaurant Name",
                    placeholder: "Urban Bites",
                  },
                  {
                    name: "restaurantTagline" as const,
                    label: "Tagline",
                    placeholder: "Fresh. Bold. Delicious.",
                  },
                  {
                    name: "logoUrl" as const,
                    label: "Logo URL",
                    placeholder: "https://example.com/logo.png",
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "heroTitle" as const,
                    label: "Hero Title",
                    placeholder: "Welcome to Urban Bites",
                  },
                  {
                    name: "heroSubtitle" as const,
                    label: "Hero Subtitle",
                    placeholder: "Fresh flavors crafted with love...",
                  },
                  {
                    name: "heroImageUrl" as const,
                    label: "Hero Background Image URL",
                    placeholder: "https://example.com/hero.jpg",
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "aboutTitle" as const,
                    label: "About Title",
                    placeholder: "Our Story",
                  },
                  {
                    name: "aboutImageUrl" as const,
                    label: "About Image URL",
                    placeholder: "https://example.com/about.jpg",
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormField
                control={form.control}
                name="aboutText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell your story..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "address" as const,
                    label: "Address",
                    placeholder: "123 Main Street, City, State",
                  },
                  {
                    name: "phone" as const,
                    label: "Phone Number",
                    placeholder: "+91 98765 43210",
                  },
                  {
                    name: "email" as const,
                    label: "Email",
                    placeholder: "hello@restaurant.com",
                  },
                  {
                    name: "openingHours" as const,
                    label: "Opening Hours",
                    placeholder: "Mon-Sun: 8:00 AM - 10:00 PM",
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Currency Selector */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Order Option */}
              <FormField
                control={form.control}
                name="isOrderingEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Enable Customer Ordering</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Customers can place orders from the menu page when this
                        is on.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Map Embed URL */}
              <FormField
                control={form.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Embed URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.google.com/maps/embed?pb=..."
                        {...field}
                        data-testid="input-mapEmbedUrl"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get this from Google Maps → Share → Embed a map → Copy the
                      src URL from the iframe code.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "facebookUrl" as const,
                    label: "Facebook URL",
                    placeholder: "https://facebook.com/...",
                  },
                  {
                    name: "instagramUrl" as const,
                    label: "Instagram URL",
                    placeholder: "https://instagram.com/...",
                  },
                  {
                    name: "twitterUrl" as const,
                    label: "Twitter/X URL",
                    placeholder: "https://twitter.com/...",
                  },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Footer</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="2024 Restaurant. All rights reserved."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateContent.isPending}
              data-testid="button-save-content"
            >
              {updateContent.isPending ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
