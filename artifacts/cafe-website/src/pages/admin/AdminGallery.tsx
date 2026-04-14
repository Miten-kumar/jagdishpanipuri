import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useGetGalleryImages, useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage, getGetGalleryImagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type GalleryImage = { id: number; imageUrl: string; caption: string; altText: string; sortOrder: number };

export default function AdminGallery() {
  const { data: images, isLoading } = useGetGalleryImages();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createImage = useCreateGalleryImage();
  const updateImage = useUpdateGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [dialog, setDialog] = useState<{ open: boolean; data?: Partial<GalleryImage> }>({ open: false });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetGalleryImagesQueryKey() });

  const handleSave = () => {
    const { data } = dialog;
    if (!data?.imageUrl) return;
    const payload = { imageUrl: data.imageUrl, caption: data.caption ?? "", altText: data.altText ?? "", sortOrder: data.sortOrder ?? 0 };
    if (data.id) {
      updateImage.mutate({ params: { id: data.id }, data: payload }, {
        onSuccess: () => { invalidate(); setDialog({ open: false }); toast({ title: "Image updated" }); },
      });
    } else {
      createImage.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setDialog({ open: false }); toast({ title: "Image added" }); },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this gallery image?")) return;
    deleteImage.mutate({ params: { id } }, { onSuccess: () => { invalidate(); toast({ title: "Image deleted" }); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage photos displayed in your gallery page.</p>
        </div>
        <Button onClick={() => setDialog({ open: true, data: {} })} data-testid="button-add-image">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-center py-10">Loading...</div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border" data-testid={`gallery-card-${img.id}`}>
              <div className="aspect-square">
                <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8"
                  onClick={() => setDialog({ open: true, data: img })}
                  data-testid={`button-edit-image-${img.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8"
                  onClick={() => handleDelete(img.id)}
                  data-testid={`button-delete-image-${img.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p>No gallery images yet. Add some to showcase your restaurant!</p>
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.data?.id ? "Edit Image" : "Add Image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Image URL</Label>
              <Input className="mt-1" value={dialog.data?.imageUrl ?? ""} placeholder="https://example.com/photo.jpg"
                onChange={(e) => setDialog((p) => ({ ...p, data: { ...p.data, imageUrl: e.target.value } }))}
                data-testid="input-gallery-image-url" />
            </div>
            {dialog.data?.imageUrl && (
              <div className="rounded-lg overflow-hidden aspect-video border border-border">
                <img src={dialog.data.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <Label>Caption</Label>
              <Input className="mt-1" value={dialog.data?.caption ?? ""} placeholder="Describe the photo"
                onChange={(e) => setDialog((p) => ({ ...p, data: { ...p.data, caption: e.target.value } }))}
                data-testid="input-gallery-caption" />
            </div>
            <div>
              <Label>Alt Text (for accessibility)</Label>
              <Input className="mt-1" value={dialog.data?.altText ?? ""} placeholder="Brief description for screen readers"
                onChange={(e) => setDialog((p) => ({ ...p, data: { ...p.data, altText: e.target.value } }))}
                data-testid="input-gallery-alt" />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input className="mt-1" type="number" value={dialog.data?.sortOrder ?? 0}
                onChange={(e) => setDialog((p) => ({ ...p, data: { ...p.data, sortOrder: parseInt(e.target.value) } }))}
                data-testid="input-gallery-sort" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleSave} data-testid="button-save-image">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
