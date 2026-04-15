import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetSiteContent, useCreateInquiry } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
interface Branch { id: number; name: string; address: string; phone: string; email: string; openingHours: string; mapUrl: string; }

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryForm = z.infer<typeof inquirySchema>;

export default function ContactPage() {
  const { data: siteContent } = useGetSiteContent();
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();
  const { data: branches } = useQuery<Branch[]>({ queryKey: ["branches"], queryFn: async () => { const r = await fetch(`${BASE}/api/branches`); return r.json(); } });

  const form = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = (data: InquiryForm) => {
    createInquiry.mutate({ data: { name: data.name, email: data.email, phone: data.phone ?? "", subject: data.subject, message: data.message } }, {
      onSuccess: () => {
        setSubmitted(true);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      },
    });
  };

  const address = siteContent?.address ?? "123 Main Street, Downtown, NY 10001";
  const phone = siteContent?.phone ?? "+1 (555) 123-4567";
  const email = siteContent?.email ?? "hello@urbanbites.com";
  const openingHours = siteContent?.openingHours ?? "Mon-Sun: 8:00 AM - 10:00 PM";

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Contact Us</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-4">Let's Connect</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Have a question, want to make a reservation, or just want to say hello? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-8">Find Us</h2>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Address", value: address, href: null },
                  { icon: Phone, label: "Phone", value: phone, href: `tel:${phone}` },
                  { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
                  { icon: Clock, label: "Opening Hours", value: openingHours, href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-8 rounded-2xl bg-muted/50 border border-border h-52 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Map View</p>
                  <p className="text-xs mt-1">{address}</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you shortly.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-send-another">
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 000-0000" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Reservation, Feedback..." {...field} data-testid="input-subject" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="message" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell us how we can help..." rows={5} {...field} data-testid="input-message" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <Button type="submit" className="w-full" disabled={createInquiry.isPending} data-testid="button-submit-inquiry">
                          {createInquiry.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Branch Locations */}
      {branches && branches.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 text-center">
              <Badge variant="secondary" className="mb-3">Our Locations</Badge>
              <h2 className="text-3xl font-bold text-foreground">Visit Any Branch</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((branch, i) => (
                <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{branch.name}</h3>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {branch.address && <div className="flex gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{branch.address}</span></div>}
                    {branch.phone && <div className="flex gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5 shrink-0" /><a href={`tel:${branch.phone}`} className="hover:text-primary transition-colors">{branch.phone}</a></div>}
                    {branch.email && <div className="flex gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5 shrink-0" /><a href={`mailto:${branch.email}`} className="hover:text-primary transition-colors">{branch.email}</a></div>}
                    {branch.openingHours && <div className="flex gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5 shrink-0" /><span>{branch.openingHours}</span></div>}
                    {branch.mapUrl && <a href={branch.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary text-xs hover:underline mt-1"><MapPin className="w-3 h-3" />View on Maps</a>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
