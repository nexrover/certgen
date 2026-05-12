/**
 * Shared category configuration for all template types.
 *
 * Each entry maps a dashboard sidebar `view` slug to
 * its display metadata, database `category` value,
 * and the builder route used when creating a new item.
 */

export interface TemplateCategoryConfig {
  /** Sidebar view slug (used in ?view=...) */
  view: string;
  /** Database category value stored in `certificate_templates.category` */
  category: string;
  /** Human-readable label */
  label: string;
  /** Short description for the empty-state card */
  description: string;
  /** Accent colour classes for the empty-state icon ring */
  iconColorClass: string;
  /** Builder route (with ?type= param) */
  builderHref: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryConfig[] = [
  {
    view: "templates",
    category: "certificate",
    label: "Certificate",
    description: "Start by creating your first professional certificate template.",
    iconColorClass: "bg-indigo-100 text-indigo-600",
    builderHref: "/builder",
  },
  {
    view: "emails",
    category: "email",
    label: "Email",
    description: "Design beautiful email templates for your campaigns.",
    iconColorClass: "bg-blue-100 text-blue-600",
    builderHref: "/builder?type=email",
  },
  {
    view: "youtube-thumbnail",
    category: "youtube",
    label: "YouTube Thumbnail",
    description: "Create eye-catching thumbnails for your YouTube videos.",
    iconColorClass: "bg-red-100 text-red-600",
    builderHref: "/builder?type=youtube",
  },
  {
    view: "ecommerce",
    category: "ecommerce",
    label: "E-commerce Marketing",
    description: "Design professional product banners and marketing graphics.",
    iconColorClass: "bg-blue-100 text-blue-600",
    builderHref: "/builder?type=ecommerce",
  },
  {
    view: "real-estate",
    category: "real-estate",
    label: "Real Estate Marketing",
    description: "Create stunning property listings and marketing materials.",
    iconColorClass: "bg-emerald-100 text-emerald-600",
    builderHref: "/builder?type=real-estate",
  },
  {
    view: "shipping-label",
    category: "shipping-label",
    label: "Shipping Label",
    description: "Generate professional shipping labels with custom layouts.",
    iconColorClass: "bg-orange-100 text-orange-600",
    builderHref: "/builder?type=shipping-label",
  },
  {
    view: "resume",
    category: "resume",
    label: "Resume",
    description: "Build modern, professional resumes with ease.",
    iconColorClass: "bg-indigo-100 text-indigo-600",
    builderHref: "/builder?type=resume",
  },
  {
    view: "open-graph",
    category: "open-graph",
    label: "Open Graph",
    description: "Create OG images that make your links stand out on social media.",
    iconColorClass: "bg-purple-100 text-purple-600",
    builderHref: "/builder?type=open-graph",
  },
  {
    view: "christmas-card",
    category: "christmas-card",
    label: "Christmas Card",
    description: "Design festive greeting cards for the holiday season.",
    iconColorClass: "bg-rose-100 text-rose-600",
    builderHref: "/builder?type=christmas-card",
  },
  {
    view: "social-media",
    category: "social-media",
    label: "Social Media",
    description: "Create social media posts and stories with perfect dimensions.",
    iconColorClass: "bg-pink-100 text-pink-600",
    builderHref: "/builder?type=social-media",
  },
  {
    view: "receipt",
    category: "receipt",
    label: "Receipt",
    description: "Generate professional receipt templates for your business.",
    iconColorClass: "bg-amber-100 text-amber-600",
    builderHref: "/builder?type=receipt",
  },
  {
    view: "invoice",
    category: "invoice",
    label: "Invoice",
    description: "Design clean, professional invoices for your clients.",
    iconColorClass: "bg-slate-100 text-slate-600",
    builderHref: "/builder?type=invoice",
  },
];

/** Look up a category config by its sidebar view slug. */
export function getCategoryByView(view: string): TemplateCategoryConfig | undefined {
  return TEMPLATE_CATEGORIES.find((c) => c.view === view);
}

/** Look up a category config by its database category value. */
export function getCategoryBySlug(slug: string): TemplateCategoryConfig | undefined {
  return TEMPLATE_CATEGORIES.find((c) => c.category === slug);
}

/** All valid sidebar view slugs that should render the template management UI. */
export const TEMPLATE_VIEW_SLUGS = TEMPLATE_CATEGORIES.map((c) => c.view);
