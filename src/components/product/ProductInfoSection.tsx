import { useMemo, useState } from "react";
import { Tag } from "lucide-react";

interface Props {
  descriptionHtml: string;
  description: string;
  tags: string[];
  title: string;
}

/** Extracts <img> tags from HTML and returns {images, cleanHtml}. */
function parseDescriptionHtml(html: string): {
  images: Array<{ src: string; alt: string }>;
  cleanHtml: string;
} {
  const images: Array<{ src: string; alt: string }> = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'][^>]*)?\/?>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push({ src: match[1], alt: match[2] ?? "" });
  }
  const cleanHtml = html
    .replace(/<img[^>]*\/?>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();
  return { images, cleanHtml };
}

/**
 * Converts a raw Shopify tag into a { label, value } pair for display.
 * Handles formats like:
 *   "hauteur-150cm"  → { label: "Hauteur", value: "150 cm" }
 *   "matière:soie"   → { label: "Matière", value: "soie" }
 *   "sans-entretien" → { label: null, value: "Sans entretien" }
 */
function parseTag(tag: string): { label: string | null; value: string } {
  // Colon-separated key:value
  if (tag.includes(":")) {
    const [key, ...rest] = tag.split(":");
    return {
      label: capitalize(key.replace(/-/g, " ")),
      value: capitalize(rest.join(":").replace(/-/g, " ")),
    };
  }
  // Detect "word-NUMBER unit" pattern like "hauteur-150cm" → Hauteur: 150 cm
  const numMatch = tag.match(/^([a-zA-ZÀ-ÿ]+)[-_](\d+)\s*([a-zA-Z]*)/);
  if (numMatch) {
    const unit = numMatch[3] ? ` ${numMatch[3]}` : "";
    return {
      label: capitalize(numMatch[1]),
      value: `${numMatch[2]}${unit}`,
    };
  }
  // Plain tag
  return { label: null, value: capitalize(tag.replace(/-/g, " ")) };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Tags to skip — purely technical/internal Shopify tags
const SKIP_TAGS = new Set(["featured", "sale", "new", "bestseller", "hidden"]);

export function ProductInfoSection({ descriptionHtml, description, tags, title }: Props) {
  const [activeTab, setActiveTab] = useState<"description" | "caracteristiques">("description");

  const { images, cleanHtml } = useMemo(
    () => (descriptionHtml ? parseDescriptionHtml(descriptionHtml) : { images: [], cleanHtml: "" }),
    [descriptionHtml],
  );

  const displayTags = useMemo(
    () => tags.filter((t) => !SKIP_TAGS.has(t.toLowerCase())).map((t) => parseTag(t)),
    [tags],
  );

  const hasDescription = cleanHtml.trim().length > 0 || description.trim().length > 0;
  const hasCharacteristics = displayTags.length > 0;
  const hasImages = images.length > 0;

  if (!hasDescription && !hasCharacteristics && !hasImages) return null;

  const tabs: Array<{ id: "description" | "caracteristiques"; label: string; show: boolean }> = [
    { id: "description", label: "Description", show: hasDescription },
    { id: "caracteristiques", label: "Caractéristiques", show: hasCharacteristics },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <h2 className="font-display text-2xl text-forest mb-8">Informations produit</h2>

      {/* Tab nav — only rendered when both sections exist */}
      {visibleTabs.length > 1 && (
        <div className="flex gap-1 mb-8 border-b border-border/60">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-forest text-forest"
                  : "border-transparent text-muted-foreground hover:text-forest"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Description tab */}
      {(activeTab === "description" || visibleTabs.length === 1) && hasDescription && (
        <div className="space-y-10">
          {/* Info images grid — always shown above the prose */}
          {hasImages && (
            <div
              className={`grid gap-3 ${
                images.length === 1
                  ? "grid-cols-1 max-w-lg"
                  : images.length === 2
                    ? "grid-cols-2"
                    : images.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-2xl bg-secondary/40 border border-border/40 ${
                    images.length >= 4 && idx === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `${title} — détail ${idx + 1}`}
                    className="w-full h-full object-cover aspect-square"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Prose content */}
          {cleanHtml ? (
            <div
              className="prose prose-sm sm:prose-base max-w-none
                prose-headings:font-display prose-headings:text-forest
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-forest prose-strong:font-semibold
                prose-a:text-forest prose-a:underline-offset-4
                prose-img:hidden"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {/* Caractéristiques tab */}
      {(activeTab === "caracteristiques" || visibleTabs.length === 1) && hasCharacteristics && (
        <div>
          {/* Key-value pairs */}
          {displayTags.some((t) => t.label !== null) && (
            <dl className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden mb-6">
              {displayTags
                .filter((t) => t.label !== null)
                .map((t, i) => (
                  <div key={i} className="flex items-center px-4 py-3 even:bg-secondary/30">
                    <dt className="w-40 text-xs font-semibold uppercase tracking-wide text-sage shrink-0">
                      {t.label}
                    </dt>
                    <dd className="text-sm text-forest font-medium">{t.value}</dd>
                  </div>
                ))}
            </dl>
          )}

          {/* Plain badges */}
          {displayTags.some((t) => t.label === null) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-sage flex items-center gap-1.5">
                <Tag className="size-3" /> Points clés
              </p>
              <div className="flex flex-wrap gap-2">
                {displayTags
                  .filter((t) => t.label === null)
                  .map((t, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-forest/20 bg-sage/10 px-3 py-1 text-xs font-medium text-forest"
                    >
                      {t.value}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
