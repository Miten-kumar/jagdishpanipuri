import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useGetSiteContent } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
  AUD: "A$",
};

const PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

export default function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    count,
    isOpen,
    setIsOpen,
  } = useCart();
  const { data: siteContent } = useGetSiteContent();
  const { toast } = useToast();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "+91",
    tableNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState<{ customerPhone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const currencySymbol =
    CURRENCY_SYMBOLS[siteContent?.currency ?? "INR"] ?? "₹";

  const validatePhone = (phone: string): string | undefined => {
    if (!phone || phone === "+91") return undefined;
    const cleaned = phone.replace(/[\s-]/g, "");
    if (!PHONE_REGEX.test(cleaned))
      return "Please enter a valid phone number (e.g. +91 98765 43210)";
    return undefined;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const phoneError = validatePhone(form.customerPhone);
    if (phoneError) {
      setErrors({ customerPhone: phoneError });
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerPhone: form.customerPhone === "+91" ? "" : form.customerPhone,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            notes: i.notes ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const data = await res.json();
      setOrderId(data.id);
      clearCart();
      setStep("success");
      toast({
        title: "Order placed!",
        description: "Your order is being prepared.",
      });
    } catch {
      toast({ title: "Failed to place order", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("cart");
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "+91",
        tableNumber: "",
        notes: "",
      });
      setErrors({});
      setOrderId(null);
    }, 300);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground text-lg">
                  {step === "cart"
                    ? `Your Cart (${count})`
                    : step === "checkout"
                      ? "Checkout"
                      : "Order Placed!"}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {step === "success" ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Order Confirmed!
                </h3>
                <p className="text-muted-foreground mb-1">Order #{orderId}</p>
                <p className="text-muted-foreground mb-6">
                  We'll prepare your items shortly. Thank you!
                </p>
                <Button onClick={handleClose} className="w-full">
                  Continue Browsing
                </Button>
              </div>
            ) : step === "checkout" ? (
              <form
                onSubmit={handleCheckout}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="customerName">Your Name *</Label>
                    <Input
                      id="customerName"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm({ ...form, customerName: e.target.value })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) =>
                        setForm({ ...form, customerEmail: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={form.customerPhone}
                      onChange={(e) => {
                        setForm({ ...form, customerPhone: e.target.value });
                        if (errors.customerPhone) setErrors({});
                      }}
                      placeholder="+91 98765 43210"
                    />
                    {errors.customerPhone && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      value={form.tableNumber}
                      onChange={(e) =>
                        setForm({ ...form, tableNumber: e.target.value })
                      }
                      placeholder="e.g. Table 5"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="notes">Special Requests</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Any dietary requirements or special requests..."
                      rows={2}
                    />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {currencySymbol}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border mt-1">
                      <span>Total</span>
                      <span>
                        {currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Placing Order..."
                      : `Place Order — ${currencySymbol}${total.toFixed(2)}`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("cart")}
                  >
                    Back to Cart
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Your cart is empty.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add items from the menu to get started.
                      </p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center gap-3 bg-muted/30 rounded-xl p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-primary text-sm font-semibold">
                            {currencySymbol}
                            {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItemId, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.menuItemId)}
                          className="text-destructive/70 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {items.length > 0 && (
                  <div className="p-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-lg font-bold text-foreground mb-3">
                      <span>Total</span>
                      <span className="text-primary">
                        {currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setStep("checkout")}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-destructive hover:text-destructive text-sm"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
