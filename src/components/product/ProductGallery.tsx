import { useEffect, useRef, useState } from "react";
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

interface ImageVariantLink {
  variantId: string;
  variantLabel: string;
}

function buildSlides(media: ShopifyMedia[] | undefined, fallback: ShopifyImage[]): Slide[] {
  if (media && media.length > 0) {
    return media
      .map((m): Slide | null => {
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
      })
      .filter(Boolean) as Slide[];
  }
  return fallback.map((i) => ({ type: "image" as const, url: i.url, alt: i.altText ?? undefined }));
}

export function ProductGallery({
  media,
  images,
  title,
  activeImageUrl,
  imageVariantLinks,
  onImageVariantSelect,
}: {
  media?: ShopifyMedia[];
  images: ShopifyImage[];
  title: string;
  activeImageUrl?: string | null;
  imageVariantLinks?: Record<string, ImageVariantLink>;
  onImageVariantSelect?: (variantId: string) => void;
}) {
  const slides = buildSlides(media, images);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [zoomIdx, setZoomIdx] = useState<number | null>(null);
  const mainFrameRef = useRef<HTMLDivElement | null>(null);
  const thumbButtonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [thumbMaxHeight, setThumbMaxHeight] = useState<number | undefined>(undefined);

  function onThumb(i: number) {
    embla?.scrollTo(i);
    const slide = slides[i];
    if (slide?.type !== "image") return;
    const linked = imageVariantLinks?.[slide.url];
    if (linked?.variantId) {
      onImageVariantSelect?.(linked.variantId);
    }
  }

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      const i = embla.selectedScrollSnap();
      setSelected(i);
    };
    embla.on("select", onSelect);
    onSelect();
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla || !activeImageUrl) return;
    const idx = slides.findIndex((slide) => slide.type === "image" && slide.url === activeImageUrl);
    if (idx >= 0 && idx !== embla.selectedScrollSnap()) {
      embla.scrollTo(idx);
      setSelected(idx);
    }
  }, [activeImageUrl, embla, slides]);

  useEffect(() => {
    const target = thumbButtonsRef.current[selected];
    target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected]);

  useEffect(() => {
    if (!mainFrameRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const nextHeight = Math.round(entry.contentRect.height);
      if (nextHeight > 0) setThumbMaxHeight(nextHeight);
    });
    observer.observe(mainFrameRef.current);
    return () => observer.disconnect();
  }, []);

  if (slides.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-secondary/50 grid place-items-center text-muted-foreground">
        Pas d'image
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3">
      {/* Thumbnails: horizontal on mobile, vertical on desktop */}
      {slides.length > 1 && (
        <div className="sm:w-[84px] sm:shrink-0">
          <div
            className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto sm:pb-0 sm:pr-1"
            style={thumbMaxHeight ? { maxHeight: thumbMaxHeight } : undefined}
          >
            {slides.map((s, i) => {
              const linked = s.type === "image" ? imageVariantLinks?.[s.url] : undefined;
              const isBasePhoto = s.type === "image" && !linked;
              return (
              <button
                key={i}
                ref={(el) => {
                  thumbButtonsRef.current[i] = el;
                }}
                onClick={() => onThumb(i)}
                className={`relative flex-[0_0_64px] sm:flex-none sm:w-[72px] sm:h-[72px] aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selected === i
                    ? "border-forest shadow-sm opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
                title={
                  s.type === "image"
                    ? linked
                      ? `Style: ${linked.variantLabel}`
                      : "Photo de base"
                    : "Média"
                }
              >
                <img src={s.url} alt="" className="size-full object-cover" />
                {s.type === "image" && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-forest">
                    {isBasePhoto ? "Base" : "Style"}
                  </span>
                )}
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 min-w-0">
        <div className="overflow-hidden rounded-2xl bg-secondary/40" ref={mainFrameRef}>
          <div ref={emblaRef}>
          <div className="flex">
            {slides.map((s, i) => (
              <div key={i} className="flex-[0_0_100%] aspect-square relative">
                {s.type === "image" ? (
                  <button
                    onClick={() => {
                      const linked = imageVariantLinks?.[s.url];
                      if (linked?.variantId) {
                        onImageVariantSelect?.(linked.variantId);
                      }
                      setZoomIdx(i);
                    }}
                    className="size-full block cursor-zoom-in"
                  >
                    <img src={s.url} alt={s.alt ?? title} className="size-full object-cover" />
                  </button>
                ) : (
                  <video controls poster={s.url} className="size-full object-cover">
                    {s.videoSources?.map((v) => (
                      <source key={v.url} src={v.url} type={v.mimeType} />
                    ))}
                  </video>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => embla?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => embla?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
        <button
          onClick={() => setZoomIdx(selected)}
          className="absolute bottom-5 right-3 size-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-muted-foreground hover:text-forest transition-colors"
          aria-label="Agrandir"
        >
          <ZoomIn className="size-3.5" />
        </button>

        {/* Slide counter */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-3 rounded-full bg-black/40 backdrop-blur text-white text-[11px] font-medium px-2.5 py-0.5">
            {selected + 1} / {slides.length}
          </div>
        )}
      </div>

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
