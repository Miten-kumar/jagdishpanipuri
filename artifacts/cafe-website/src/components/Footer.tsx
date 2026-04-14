import { Link } from "wouter";
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { useGetSiteContent } from "@workspace/api-client-react";

export default function Footer() {
  const { data: siteContent } = useGetSiteContent();

  const restaurantName = siteContent?.restaurantName ?? "Urban Bites";
  const tagline = siteContent?.restaurantTagline ?? "Fresh. Bold. Delicious.";
  const address = siteContent?.address ?? "123 Main Street, Downtown, NY 10001";
  const phone = siteContent?.phone ?? "+1 (555) 123-4567";
  const email = siteContent?.email ?? "hello@urbanbites.com";
  const openingHours = siteContent?.openingHours ?? "Mon-Sun: 8:00 AM - 10:00 PM";
  const footerText = siteContent?.footerText ?? `${new Date().getFullYear()} Urban Bites. All rights reserved.`;
  const facebookUrl = siteContent?.facebookUrl;
  const instagramUrl = siteContent?.instagramUrl;
  const twitterUrl = siteContent?.twitterUrl;

  return (
    <footer className="bg-foreground text-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background" style={{ fontFamily: "'Playfair Display', serif" }}>
                {restaurantName}
              </span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              {tagline}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="link-facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="link-instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  data-testid="link-twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {!facebookUrl && !instagramUrl && !twitterUrl && (
                <>
                  <div className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-background font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Menu", href: "/menu" },
                { label: "Gallery", href: "/gallery" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-background/60 text-sm hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-background font-semibold text-sm uppercase tracking-wider mb-4">Visit Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-background/60 text-sm">{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${phone}`} className="text-background/60 text-sm hover:text-background transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${email}`} className="text-background/60 text-sm hover:text-background transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-background/60 text-sm">{openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/40 text-xs">{footerText}</p>
          <Link href="/admin" className="text-background/30 text-xs hover:text-background/60 transition-colors">
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
