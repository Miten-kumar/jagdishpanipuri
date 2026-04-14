import { Link } from "wouter";
import { ArrowRight, Star, Clock, MapPin, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useGetSiteContent, useGetMenuItems, useGetMenuCategories, useGetGalleryImages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function FoodPlaceholder({ name }: { name: string }) {
  const colors = ["bg-amber-100", "bg-orange-100", "bg-yellow-100", "bg-red-50"];
  const idx = name.length % colors.length;
  return (
    <div className={`w-full h-full ${colors[idx]} flex items-center justify-center`}>
      <span className="text-4xl font-serif font-bold text-amber-400/50">{name[0]}</span>
    </div>
  );
}

export default function HomePage() {
  const { data: siteContent } = useGetSiteContent();
  const { data: menuItems } = useGetMenuItems();
  const { data: categories } = useGetMenuCategories();
  const { data: galleryImages } = useGetGalleryImages();

  const heroTitle = siteContent?.heroTitle ?? "Welcome to Urban Bites";
  const heroSubtitle = siteContent?.heroSubtitle ?? "Fresh, bold flavors crafted with love.";
  const heroImageUrl = siteContent?.heroImageUrl;
  const aboutTitle = siteContent?.aboutTitle ?? "Our Story";
  const aboutText = siteContent?.aboutText ?? "Urban Bites was born from a passion for honest food and great coffee.";
  const aboutImageUrl = siteContent?.aboutImageUrl;

  const featuredItems = menuItems?.filter((i) => i.isFeatured).slice(0, 6) ?? [];
  const galleryPreview = galleryImages?.slice(0, 6) ?? [];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroImageUrl ? (
          <div className="absolute inset-0">
            <img src={heroImageUrl} alt="Restaurant" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,200,50,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(220,50,50,0.3) 0%, transparent 50%)" }}
            />
          </div>
        )}

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-primary/90 text-primary-foreground border-none px-4 py-1.5 text-sm">
              Fresh Daily
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8 shadow-xl">
                <Link href="/menu" data-testid="button-view-menu">
                  Explore Our Menu <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="text-base px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/contact" data-testid="button-reserve">
                  Reserve a Table
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Happy Customers Daily" },
              { value: "50+", label: "Menu Items" },
              { value: "10+", label: "Years of Excellence" },
              { value: "4.9", label: "Star Rating" },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}>
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.value}</div>
                <div className="text-primary-foreground/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ITEMS */}
      {featuredItems.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <Badge variant="secondary" className="mb-3">Featured</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-3">Guest Favorites</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Hand-picked dishes our guests keep coming back for.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow group"
                  data-testid={`card-featured-${item.id}`}>
                  <div className="h-52 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <FoodPlaceholder name={item.name} />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-lg leading-tight">{item.name}</h3>
                      <span className="text-primary font-bold text-lg ml-2 shrink-0">${item.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{item.description}</p>
                    {item.tags && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link href="/menu" data-testid="button-full-menu">View Full Menu <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ABOUT PREVIEW */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <Badge variant="secondary" className="mb-4">About Us</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-6">{aboutTitle}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">{aboutText}</p>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                {[
                  { icon: Star, text: "Premium Ingredients" },
                  { icon: Clock, text: "Fast Service" },
                  { icon: MapPin, text: "Prime Location" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{text}</span>
                  </div>
                ))}
              </div>
              <Button asChild>
                <Link href="/about" data-testid="button-learn-more">Learn More <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                {aboutImageUrl ? (
                  <img src={aboutImageUrl} alt="About us" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                    <div className="text-center text-amber-600">
                      <Star className="w-16 h-16 mx-auto mb-3 opacity-40" />
                      <p className="font-serif text-2xl font-bold opacity-40">Our Kitchen</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg">
                <div className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>10+</div>
                <div className="text-xs text-primary-foreground/80">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {galleryPreview.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <Badge variant="secondary" className="mb-3">Gallery</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-3">Visual Delights</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryPreview.map((img, i) => (
                <motion.div key={img.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`overflow-hidden rounded-xl ${i === 0 ? "row-span-2" : ""}`}>
                  <img src={img.imageUrl} alt={img.altText}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    style={{ height: i === 0 ? "320px" : "150px" }} />
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link href="/gallery" data-testid="button-view-gallery">See Full Gallery <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES PREVIEW */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-foreground mb-2">Explore Our Menu</h2>
              <p className="text-muted-foreground">Something for every craving</p>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}>
                  <Link href={`/menu?category=${cat.id}`}
                    className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-md transition-all group"
                    data-testid={`link-category-${cat.id}`}>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-2xl">{cat.iconName.length === 1 ? cat.iconName : "🍽"}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ready to Experience Urban Bites?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Visit us today or make a reservation for your next special occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact" data-testid="button-contact-cta">Get in Touch</Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="border-white/30 text-white hover:bg-white/10">
                <Link href="/menu" data-testid="button-menu-cta">See Our Menu</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
