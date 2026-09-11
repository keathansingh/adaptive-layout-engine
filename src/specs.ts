export type ElementType = "text" | "image" | "button";

export type ElementRole =
  | "primary"
  | "hero"
  | "action"
  | "branding"
  | "secondary";

export interface AdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: number;
  content: string;
  aspectRatio?: number;
}

export interface AdSpec {
  elements: AdElement[];
}

export function defineAd(spec: AdSpec): AdSpec {
  return spec;
}

export const adSpec = defineAd({
  elements: [
    {
      id: "headline",
      type: "text",
      role: "primary",
      priority: 1,
      content: "Summer Sale — Up to 40% Off",
    },
    {
      id: "product-image",
      type: "image",
      role: "hero",
      priority: 1,
      content: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      aspectRatio: 1,
    },
    {
      id: "cta",
      type: "button",
      role: "action",
      priority: 2,
      content: "Shop Now",
    },
    {
      id: "price",
      type: "text",
      role: "secondary",
      priority: 2,
      content: "Starting at ₹1,999",
    },
    {
      id: "logo",
      type: "image",
      role: "branding",
      priority: 3,
      content: "FLAM",
      aspectRatio: 3,
    },
  ],
});