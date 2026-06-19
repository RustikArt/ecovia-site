import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ShopifyMedia, ShopifyImage } from "@/lib/shopify/types";

interface Slide {
  type: "image" | "video";
  url: string;
  alt?: string;
  videoSources?: Array<{ url: string; mimeType: string }>;
}

function buildSlides(media: ShopifyMedia[] | undefined, fallback: ShopifyImage[]): Slide[] {
  if (media && media.length > 0) {
    return media.map((m): Slide | null => {
      if (m.mediaContentType === "VIDEO" && m.sources?.length) {
        return {
          type: "video",
          url: m.previewImage?.url ?? "",
          videoSources: m.sources.map((s) => ({ url: s.url, mimeType: s.mimeType })),
        };
      }
      const img = m.image ?? (m.previewImage ? { url: m.previewImage.url, altText: null } : null);
      if (!img) return null;
      return { type: "image", url: img.url, alt: img.altText ?? undefined };
    }).filter(Boolean) as Slide[];
  }
  return fallback.map((i) => ({ type: "image" as const, url: i.url, alt: i.altText ?? undefined }));
}

export function ProductGallery({ media, images, title }: { media?: ShopifyMedia[]; images: ShopifyImage[]; title: string }) {
  const slides = buildSlides(media, images);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [selected, setSelected] = useState(0);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);

  function onThumb(i: number) {
    embla?.scrollTo(i);
  }
  embla?.on("select", () => {
    const i = embla.selectedScrollSnap();
    setSelected(i);
    thumbApi?.scrollTo(i);
  });

  if (slides.length === 0) {
    return <div className="aspect-square rounded-3xl bg-secondary/50 grid place-items-center text-muted-foreground">Pas d'image</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="overflow-hidden rounded-3xl bg-secondary/40" ref={emblaRef}>
          <div className="flex">
            {slides.map((s, i) => (
              <div key={i} className="flex-[0_0_100%] aspect-square relative">
                {s.type === "image" ? (
                  <button onClick={() => setZoomIdx(i)} className="size-full block cursor-zoom-in">
                    <img src={s.url} alt={s.alt ?? title} className="size-full object-cover" />
                  </button>
                ) : (
                  <video controls poster={s.url} className="size-full object-cover">
                    {s.videoSources?.map((v) => <source key={v.url} src={v.url} type={v.mimeType} />)}
                  </video>
                )}
              </div>
            ))}
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button onClick={() => embla?.scrollPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur grid place-items-center hover:bg-background shadow" aria-label="Précédent">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => embla?.scrollNext()} className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur grid place-items-center hover:bg-background shadow" aria-label="Suivant">
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 right-3 size-9 rounded-full bg-background/80 backdrop-blur grid place-items-center text-muted-foreground">
              <ZoomIn className="size-4" />
            </div>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => onThumb(i)}
                className={`flex-[0_0_64px] aspect-square rounded-xl overflow-hidden border-2 transition ${selected === i ? "border-forest" : "border-transparent opacity-60"}`}
              >
                <img src={s.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={zoomIdx !== null} onOpenChange={(open) => !open && setZoomIdx(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          {zoomIdx !== null && slides[zoomIdx] && (
            <img src={slides[zoomIdx].url} alt={title} className="w-full h-auto rounded-2xl" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
