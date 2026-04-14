import { motion } from "framer-motion";
import { Star, Heart, Leaf, Award } from "lucide-react";
import { useGetSiteContent } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const values = [
  { icon: Heart, title: "Crafted with Love", desc: "Every dish is prepared with care and attention to detail, from sourcing to plating." },
  { icon: Leaf, title: "Fresh Ingredients", desc: "We partner with local farms to bring you the freshest seasonal ingredients every day." },
  { icon: Star, title: "Exceptional Quality", desc: "Our chefs hold themselves to the highest standards so every bite exceeds your expectations." },
  { icon: Award, title: "Award Winning", desc: "Recognized as one of the best dining experiences in the city for over a decade." },
];

const teamMembers = [
  { name: "Chef Marco Rossi", role: "Head Chef", initials: "MR", color: "bg-amber-200" },
  { name: "Sarah Chen", role: "Pastry Chef", initials: "SC", color: "bg-orange-200" },
  { name: "James Walker", role: "Cafe Manager", initials: "JW", color: "bg-yellow-200" },
];

export default function AboutPage() {
  const { data: siteContent } = useGetSiteContent();
  const aboutTitle = siteContent?.aboutTitle ?? "Our Story";
  const aboutText = siteContent?.aboutText ?? "Urban Bites was born from a passion for honest food and great coffee.";
  const aboutImageUrl = siteContent?.aboutImageUrl;
  const restaurantName = siteContent?.restaurantName ?? "Urban Bites";

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-4">Our Story</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6">{aboutTitle}</h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">{aboutText}</p>
          </motion.div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                {aboutImageUrl ? (
                  <img src={aboutImageUrl} alt="About" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                    <div className="text-center text-amber-600 opacity-50">
                      <Star className="w-20 h-20 mx-auto mb-4" />
                      <p className="font-serif text-3xl font-bold">{restaurantName}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-foreground mb-6">Where Every Meal Tells a Story</h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  {restaurantName} started as a small corner cafe with a big dream — to create a space where neighbors become friends over exceptional food and coffee. Today, we've grown into one of the most beloved dining destinations in the city.
                </p>
                <p>
                  Our menu is a love letter to bold flavors and fresh ingredients. From our signature gourmet burgers to hand-brewed artisan coffees, every item is crafted with intention and served with heart.
                </p>
                <p>
                  We believe food is more than sustenance — it's connection, memory, and joy. We're honored to be part of your stories, whether it's a quick breakfast before work or a celebratory dinner with loved ones.
                </p>
              </div>
              <Button asChild className="mt-8">
                <Link href="/menu" data-testid="button-about-menu">Discover Our Menu</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-foreground mb-3">What We Stand For</h2>
            <p className="text-muted-foreground text-lg">The values that guide everything we do</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-foreground mb-3">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg">The passionate people behind every dish</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
                data-testid={`card-team-${i}`}>
                <div className={`w-24 h-24 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-700/60`}
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {member.initials}
                </div>
                <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-3">Our Journey</h2>
          </motion.div>
          <div className="space-y-8">
            {[
              { year: "2014", event: "Urban Bites opens its first location as a small corner cafe." },
              { year: "2017", event: "Awarded Best Burger in the City by local food critics." },
              { year: "2020", event: "Expanded the menu with artisan coffees and fresh bakery items." },
              { year: "2024", event: "Celebrating 10 years of bringing bold flavors to our community." },
            ].map((item, i) => (
              <motion.div key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start">
                <div className="shrink-0 w-16 text-right">
                  <span className="font-bold text-primary-foreground/60 text-sm">{item.year}</span>
                </div>
                <div className="w-px bg-primary-foreground/20 mt-1.5 shrink-0 h-full" />
                <div className="flex-1">
                  <div className="w-3 h-3 bg-primary-foreground rounded-full -ml-1.5 mt-0.5 mb-2 shrink-0 absolute" style={{ marginLeft: "-0.4rem", marginTop: "0.15rem" }} />
                  <p className="text-primary-foreground/90 leading-relaxed">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
