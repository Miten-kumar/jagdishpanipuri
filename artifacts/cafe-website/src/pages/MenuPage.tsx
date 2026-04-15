import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Plus } from "lucide-react";
import { useGetMenuCategories, useGetMenuItems } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";

function FoodPlaceholder({ name }: { name: string }) {
  const colors = ["bg-amber-100", "bg-orange-100", "bg-yellow-50", "bg-red-50"];
  const idx = name.length % colors.length;
  return (
    <div className={`w-full h-full ${colors[idx]} flex items-center justify-center`}>
      <span className="text-5xl font-serif font-bold text-amber-400/40">{name[0]}</span>
    </div>
  );
}

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { count, setIsOpen } = useCart();

  const { data: categories, isLoading: catLoading } = useGetMenuCategories();
  const { data: allItems, isLoading: itemsLoading } = useGetMenuItems();

  const filteredItems = allItems?.filter((item) => {
    const matchCat = selectedCategory === null || item.categoryId === selectedCategory;
    const matchSearch = search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && item.isAvailable;
  }) ?? [];

  if (catLoading || itemsLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-muted-foreground">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <CartSidebar />
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Our Menu</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-4">Every Bite, a Story</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Explore our carefully crafted menu — from morning coffee to evening bites.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-menu" />
            </div>
            <div className="flex gap-2 flex-wrap flex-1">
              <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} data-testid="filter-all">All Items</Button>
              {categories?.map((cat) => (
                <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)} data-testid={`filter-category-${cat.id}`}>
                  {cat.name}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="relative shrink-0" onClick={() => setIsOpen(true)} data-testid="button-open-cart">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{count}</span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No items found. Try a different search or category.</p>
            </div>
          ) : (
            <>
              {selectedCategory === null && search === "" ? (
                <div className="space-y-16">
                  {categories?.map((cat) => {
                    const catItems = allItems?.filter((i) => i.categoryId === cat.id && i.isAvailable) ?? [];
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-foreground">{cat.name}</h2>
                            <Badge variant="secondary">{catItems.length} items</Badge>
                          </div>
                          {cat.description && <p className="text-muted-foreground">{cat.description}</p>}
                        </motion.div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {catItems.map((item, i) => <MenuItemCard key={item.id} item={item} index={i} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredItems.map((item, i) => <MenuItemCard key={item.id} item={item} index={i} />)}
                  </div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function MenuItemCard({ item, index }: { item: { id: number; name: string; description: string; price: string; imageUrl: string; isFeatured: boolean; tags: string; isAvailable: boolean }; index: number }) {
  const { addItem } = useCart();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }} viewport={{ once: true }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
      data-testid={`card-menu-item-${item.id}`}>
      <div className="h-44 overflow-hidden relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full bg-amber-50 flex items-center justify-center`}>
            <span className="text-5xl font-serif font-bold text-amber-400/40">{item.name[0]}</span>
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-2 right-2"><Badge className="text-xs">Featured</Badge></div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
          <span className="text-primary font-bold ml-2 shrink-0">${item.price}</span>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
        {item.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">{tag}</Badge>
            ))}
          </div>
        )}
        <Button size="sm" className="w-full gap-1.5" onClick={() => addItem({ menuItemId: item.id, name: item.name, price: parseFloat(item.price) })} data-testid={`button-add-to-cart-${item.id}`}>
          <Plus className="w-3.5 h-3.5" />
          Add to Order
        </Button>
      </div>
    </motion.div>
  );
}
