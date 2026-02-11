export const galleryComponentDocs = {
  "approval-card": {
    name: "Approval Card",
    docsHref: "/docs/approval-card",
  },
  audio: {
    name: "Audio",
    docsHref: "/docs/audio",
  },
  chart: {
    name: "Chart",
    docsHref: "/docs/chart",
  },
  citation: {
    name: "Citation",
    docsHref: "/docs/citation",
  },
  "code-block": {
    name: "Code Block",
    docsHref: "/docs/code-block",
  },
  "data-table": {
    name: "Data Table",
    docsHref: "/docs/data-table",
  },
  image: {
    name: "Image",
    docsHref: "/docs/image",
  },
  "image-gallery": {
    name: "Image Gallery",
    docsHref: "/docs/image-gallery",
  },
  "item-carousel": {
    name: "Item Carousel",
    docsHref: "/docs/item-carousel",
  },
  "link-preview": {
    name: "Link Preview",
    docsHref: "/docs/link-preview",
  },
  "linkedin-post": {
    name: "LinkedIn Post",
    docsHref: "/docs/linkedin-post",
  },
  "message-draft": {
    name: "Message Draft",
    docsHref: "/docs/message-draft",
  },
  "option-list": {
    name: "Option List",
    docsHref: "/docs/option-list",
  },
  "order-summary": {
    name: "Order Summary",
    docsHref: "/docs/order-summary",
  },
  plan: {
    name: "Plan",
    docsHref: "/docs/plan",
  },
  "preferences-panel": {
    name: "Preferences Panel",
    docsHref: "/docs/preferences-panel",
  },
  "progress-tracker": {
    name: "Progress Tracker",
    docsHref: "/docs/progress-tracker",
  },
  "question-flow": {
    name: "Question Flow",
    docsHref: "/docs/question-flow",
  },
  "stats-display": {
    name: "Stats Display",
    docsHref: "/docs/stats-display",
  },
  terminal: {
    name: "Terminal",
    docsHref: "/docs/terminal",
  },
  video: {
    name: "Video",
    docsHref: "/docs/video",
  },
  "weather-widget": {
    name: "Weather Widget",
    docsHref: "/docs/weather-widget",
  },
} as const satisfies Record<
  string,
  { name: string; docsHref: `/docs/${string}` }
>;

export type GalleryComponentDocId = keyof typeof galleryComponentDocs;
