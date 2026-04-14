import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useGetGalleryImages } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function GalleryPage() {
  const { data: images, isLoading } = useGetGalleryImages();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i === null || i === 0 ? (images?.length ?? 1) - 1 : i - 1));
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % (images?.length ?? 1)));

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Gallery</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-4">Visual Feast</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A glimpse into our world — the food, the space, the atmosphere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading gallery...</div>
          ) : images && images.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  viewport={{ once: true }}
                  className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => openLightbox(i)}
                  data-testid={`gallery-image-${img.id}`}>
                  <img
                    src={img.imageUrl}
                    alt={img.altText}
                    className="w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    style={{ maxHeight: "400px", minHeight: "150px" }}
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors rounded-xl flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Gallery images will appear here. Add them from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}>
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
              onClick={closeLightbox}
              data-testid="button-close-lightbox">
              <X className="w-6 h-6" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              data-testid="button-prev-image">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2"
              onClick={(e) => { e.stopPropagation(); next(); }}
              data-testid="button-next-image">
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}>
              <img
                src={images[lightboxIndex].imageUrl}
                alt={images[lightboxIndex].altText}
                className="w-full h-full object-contain rounded-xl"
                style={{ maxHeight: "80vh" }}
              />
              {images[lightboxIndex].caption && (
                <p className="text-white/80 text-center mt-3 text-sm">{images[lightboxIndex].caption}</p>
              )}
              <p className="text-white/40 text-center mt-1 text-xs">{lightboxIndex + 1} / {images.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
