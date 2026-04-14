import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  footerText: z.string().min(1, "Required"),
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
      restaurantName: "", restaurantTagline: "", logoUrl: "",
      heroTitle: "", heroSubtitle: "", heroImageUrl: "",
      aboutTitle: "", aboutText: "", aboutImageUrl: "",
      address: "", phone: "", email: "", openingHours: "",
      facebookUrl: "", instagramUrl: "", twitterUrl: "", footerText: "",
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
        facebookUrl: siteContent.facebookUrl ?? "",
        instagramUrl: siteContent.instagramUrl ?? "",
        twitterUrl: siteContent.twitterUrl ?? "",
        footerText: siteContent.footerText ?? "",
      });
    }
  }, [siteContent, form]);

  const onSubmit = (data: ContentForm) => {
    updateContent.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSiteContentQueryKey() });
        toast({ title: "Saved!", description: "Site content updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save content.", variant: "destructive" });
      },
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  const sections = [
    {
      title: "Brand Identity",
      fields: [
        { name: "restaurantName" as const, label: "Restaurant Name", placeholder: "Urban Bites" },
        { name: "restaurantTagline" as const, label: "Tagline", placeholder: "Fresh. Bold. Delicious." },
        { name: "logoUrl" as const, label: "Logo URL", placeholder: "https://example.com/logo.png" },
      ],
    },
    {
      title: "Hero Section",
      fields: [
        { name: "heroTitle" as const, label: "Hero Title", placeholder: "Welcome to Urban Bites" },
        { name: "heroSubtitle" as const, label: "Hero Subtitle", placeholder: "Fresh flavors crafted with love..." },
        { name: "heroImageUrl" as const, label: "Hero Background Image URL", placeholder: "https://example.com/hero.jpg" },
      ],
    },
    {
      title: "About Section",
      fields: [
        { name: "aboutTitle" as const, label: "About Title", placeholder: "Our Story" },
        { name: "aboutImageUrl" as const, label: "About Image URL", placeholder: "https://example.com/about.jpg" },
      ],
      textareas: [
        { name: "aboutText" as const, label: "About Text", placeholder: "Tell your story..." },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        { name: "address" as const, label: "Address", placeholder: "123 Main Street, City, State" },
        { name: "phone" as const, label: "Phone Number", placeholder: "+1 (555) 000-0000" },
        { name: "email" as const, label: "Email", placeholder: "hello@restaurant.com" },
        { name: "openingHours" as const, label: "Opening Hours", placeholder: "Mon-Sun: 8:00 AM - 10:00 PM" },
      ],
    },
    {
      title: "Social Media",
      fields: [
        { name: "facebookUrl" as const, label: "Facebook URL", placeholder: "https://facebook.com/..." },
        { name: "instagramUrl" as const, label: "Instagram URL", placeholder: "https://instagram.com/..." },
        { name: "twitterUrl" as const, label: "Twitter/X URL", placeholder: "https://twitter.com/..." },
      ],
    },
    {
      title: "Footer",
      textareas: [
        { name: "footerText" as const, label: "Footer Text", placeholder: "2024 Restaurant. All rights reserved." },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site Content</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit all text and images across your website.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields?.map((field) => (
                    <FormField key={field.name} control={form.control} name={field.name} render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input placeholder={field.placeholder} {...f} data-testid={`input-${field.name}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </div>
                {section.textareas?.map((field) => (
                  <FormField key={field.name} control={form.control} name={field.name} render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={field.placeholder} rows={4} {...f} data-testid={`textarea-${field.name}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button type="submit" disabled={updateContent.isPending} data-testid="button-save-content">
              {updateContent.isPending ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
