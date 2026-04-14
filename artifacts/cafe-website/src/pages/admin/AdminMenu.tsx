import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { useGetMenuCategories, useGetMenuItems, useCreateMenuCategory, useUpdateMenuCategory, useDeleteMenuCategory, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, getGetMenuCategoriesQueryKey, getGetMenuItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Category = { id: number; name: string; description: string; iconName: string; sortOrder: number };
type MenuItem = { id: number; categoryId: number; name: string; description: string; price: string; imageUrl: string; isAvailable: boolean; isFeatured: boolean; tags: string; sortOrder: number };

export default function AdminMenu() {
  const { data: categories } = useGetMenuCategories();
  const { data: menuItems } = useGetMenuItems();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  const createCategory = useCreateMenuCategory();
  const updateCategory = useUpdateMenuCategory();
  const deleteCategory = useDeleteMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  const [catDialog, setCatDialog] = useState<{ open: boolean; data?: Partial<Category> }>({ open: false });
  const [itemDialog, setItemDialog] = useState<{ open: boolean; data?: Partial<MenuItem>; categoryId?: number }>({ open: false });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() });
  };

  const toggleCat = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveCategory = () => {
    const { data } = catDialog;
    if (!data?.name) return;
    const payload = { name: data.name, description: data.description ?? "", iconName: data.iconName ?? "🍽", sortOrder: data.sortOrder ?? 0 };
    if (data.id) {
      updateCategory.mutate({ params: { id: data.id }, data: payload }, {
        onSuccess: () => { invalidate(); setCatDialog({ open: false }); toast({ title: "Category updated" }); },
      });
    } else {
      createCategory.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setCatDialog({ open: false }); toast({ title: "Category created" }); },
      });
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm("Delete this category and all its items?")) return;
    deleteCategory.mutate({ params: { id } }, { onSuccess: () => { invalidate(); toast({ title: "Category deleted" }); } });
  };

  const handleSaveItem = () => {
    const { data, categoryId } = itemDialog;
    if (!data?.name || !data?.price) return;
    const payload = {
      categoryId: data.categoryId ?? categoryId ?? 0,
      name: data.name, description: data.description ?? "", price: data.price,
      imageUrl: data.imageUrl ?? "", isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false, tags: data.tags ?? "", sortOrder: data.sortOrder ?? 0,
    };
    if (data.id) {
      updateItem.mutate({ params: { id: data.id }, data: payload }, {
        onSuccess: () => { invalidate(); setItemDialog({ open: false }); toast({ title: "Item updated" }); },
      });
    } else {
      createItem.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setItemDialog({ open: false }); toast({ title: "Item created" }); },
      });
    }
  };

  const handleDeleteItem = (id: number) => {
    if (!confirm("Delete this menu item?")) return;
    deleteItem.mutate({ params: { id } }, { onSuccess: () => { invalidate(); toast({ title: "Item deleted" }); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Add, edit, and organize your menu categories and items.</p>
        </div>
        <Button onClick={() => setCatDialog({ open: true, data: {} })} data-testid="button-add-category">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories?.map((cat) => {
          const catItems = menuItems?.filter((i) => i.categoryId === cat.id) ?? [];
          const isExpanded = expandedCats.has(cat.id);
          return (
            <Card key={cat.id} data-testid={`category-card-${cat.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleCat(cat.id)}>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{catItems.length} items</Badge>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => setItemDialog({ open: true, data: { categoryId: cat.id }, categoryId: cat.id })}
                      data-testid={`button-add-item-${cat.id}`}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => setCatDialog({ open: true, data: cat })}
                      data-testid={`button-edit-category-${cat.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(cat.id)}
                      data-testid={`button-delete-category-${cat.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0">
                  {catItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No items yet. Click + to add one.</p>
                  ) : (
                    <div className="space-y-2">
                      {catItems.map((item) => (
                        <div key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
                          data-testid={`menu-item-row-${item.id}`}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">{item.name}</span>
                              <span className="text-primary font-bold text-sm">${item.price}</span>
                              {item.isFeatured && <Badge className="text-xs">Featured</Badge>}
                              {!item.isAvailable && <Badge variant="secondary" className="text-xs">Unavailable</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                            {item.tags && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => setItemDialog({ open: true, data: item })}
                              data-testid={`button-edit-item-${item.id}`}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
                              data-testid={`button-delete-item-${item.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
        {(!categories || categories.length === 0) && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No categories yet. Start by adding a category.</p>
          </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={catDialog.open} onOpenChange={(open) => setCatDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{catDialog.data?.id ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Category Name</Label>
              <Input className="mt-1" value={catDialog.data?.name ?? ""} placeholder="e.g. Burgers, Coffee"
                onChange={(e) => setCatDialog((prev) => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                data-testid="input-category-name" />
            </div>
            <div>
              <Label>Description</Label>
              <Input className="mt-1" value={catDialog.data?.description ?? ""} placeholder="Brief description"
                onChange={(e) => setCatDialog((prev) => ({ ...prev, data: { ...prev.data, description: e.target.value } }))}
                data-testid="input-category-description" />
            </div>
            <div>
              <Label>Icon (emoji or name)</Label>
              <Input className="mt-1" value={catDialog.data?.iconName ?? ""} placeholder="🍔 or Utensils"
                onChange={(e) => setCatDialog((prev) => ({ ...prev, data: { ...prev.data, iconName: e.target.value } }))}
                data-testid="input-category-icon" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveCategory} data-testid="button-save-category">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialog.open} onOpenChange={(open) => setItemDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{itemDialog.data?.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input className="mt-1" value={itemDialog.data?.name ?? ""} placeholder="Classic Burger"
                  onChange={(e) => setItemDialog((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                  data-testid="input-item-name" />
              </div>
              <div>
                <Label>Price</Label>
                <Input className="mt-1" value={itemDialog.data?.price ?? ""} placeholder="12.99"
                  onChange={(e) => setItemDialog((p) => ({ ...p, data: { ...p.data, price: e.target.value } }))}
                  data-testid="input-item-price" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={itemDialog.data?.description ?? ""} placeholder="Describe the item..." rows={3}
                onChange={(e) => setItemDialog((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                data-testid="input-item-description" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input className="mt-1" value={itemDialog.data?.imageUrl ?? ""} placeholder="https://example.com/image.jpg"
                onChange={(e) => setItemDialog((p) => ({ ...p, data: { ...p.data, imageUrl: e.target.value } }))}
                data-testid="input-item-image" />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input className="mt-1" value={itemDialog.data?.tags ?? ""} placeholder="Spicy, Vegan, Popular"
                onChange={(e) => setItemDialog((p) => ({ ...p, data: { ...p.data, tags: e.target.value } }))}
                data-testid="input-item-tags" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemDialog.data?.isAvailable ?? true}
                  onCheckedChange={(v) => setItemDialog((p) => ({ ...p, data: { ...p.data, isAvailable: v } }))}
                  data-testid="switch-item-available"
                />
                <Label>Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemDialog.data?.isFeatured ?? false}
                  onCheckedChange={(v) => setItemDialog((p) => ({ ...p, data: { ...p.data, isFeatured: v } }))}
                  data-testid="switch-item-featured"
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSaveItem} data-testid="button-save-item">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
