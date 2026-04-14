import { useEffect, useState } from "react";
import { useGetTheme, useUpdateTheme, getGetThemeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

const FONT_OPTIONS = ["Inter", "Roboto", "Playfair Display", "Lato", "Open Sans", "Poppins", "Merriweather", "Montserrat"];

function hslToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/);
    if (parts.length < 3) return "#f97316";
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch {
    return "#f97316";
  }
}

function hexToHsl(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return "25 90% 55%";
  }
}

export default function AdminTheme() {
  const { data: theme, isLoading } = useGetTheme();
  const updateTheme = useUpdateTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refetch } = useTheme();

  const [primaryHex, setPrimaryHex] = useState("#f97316");
  const [secondaryHex, setSecondaryHex] = useState("#fff7ed");
  const [accentHex, setAccentHex] = useState("#ea580c");
  const [fontFamily, setFontFamily] = useState("Inter");

  useEffect(() => {
    if (theme) {
      setPrimaryHex(hslToHex(theme.primaryColor));
      setSecondaryHex(hslToHex(theme.secondaryColor));
      setAccentHex(hslToHex(theme.accentColor));
      setFontFamily(theme.fontFamily);
    }
  }, [theme]);

  const handleSave = () => {
    updateTheme.mutate({
      data: {
        primaryColor: hexToHsl(primaryHex),
        secondaryColor: hexToHsl(secondaryHex),
        accentColor: hexToHsl(accentHex),
        fontFamily,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey() });
        refetch();
        toast({ title: "Theme Updated!", description: "Your color theme has been applied to the site." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update theme.", variant: "destructive" });
      },
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Theme Color</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize the color palette and typography across the entire website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Pickers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Primary Color", desc: "Main buttons, links, and accents", value: primaryHex, setter: setPrimaryHex, testId: "color-primary" },
              { label: "Secondary Color", desc: "Backgrounds and secondary elements", value: secondaryHex, setter: setSecondaryHex, testId: "color-secondary" },
              { label: "Accent Color", desc: "Highlights and call-to-action elements", value: accentHex, setter: setAccentHex, testId: "color-accent" },
            ].map((colorField) => (
              <div key={colorField.label} className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer overflow-hidden shadow-sm"
                    style={{ backgroundColor: colorField.value }}>
                    <input
                      type="color"
                      value={colorField.value}
                      onChange={(e) => colorField.setter(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      data-testid={colorField.testId}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="font-medium">{colorField.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">{colorField.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: colorField.value }} />
                    <span className="text-xs font-mono text-muted-foreground">{colorField.value.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Font & Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="font-medium mb-3 block">Font Family</Label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    data-testid={`font-option-${font.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`px-3 py-2.5 rounded-lg text-sm border text-left transition-all ${
                      fontFamily === font
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                    style={{ fontFamily: font }}>
                    {font}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="p-4" style={{ backgroundColor: secondaryHex }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryHex }}>
                      <span className="text-white text-xs font-bold">U</span>
                    </div>
                    <span className="font-bold text-sm" style={{ fontFamily, color: "#1a1a1a" }}>Urban Bites</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily }}>Welcome to Our Restaurant</h3>
                  <p className="text-xs text-gray-600 mb-3">Fresh, bold flavors crafted with love.</p>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: primaryHex }}>
                      Order Now
                    </div>
                    <div className="px-4 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: primaryHex, color: primaryHex }}>
                      Learn More
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-900 flex gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryHex }} />
                  <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: accentHex }} />
                  <div className="w-2 h-2 rounded-full opacity-20 bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={updateTheme.isPending} data-testid="button-save-theme">
          {updateTheme.isPending ? "Applying..." : "Apply Theme to Site"}
        </Button>
      </div>
    </div>
  );
}
