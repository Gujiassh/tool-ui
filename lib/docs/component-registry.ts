export type ComponentCategory =
  | "media"
  | "artifacts"
  | "display"
  | "input"
  | "confirmation"
  | "progress";

export interface CategoryMeta {
  label: string;
  order: number;
}

export const CATEGORY_META: Record<ComponentCategory, CategoryMeta> = {
  progress: { label: "Progress", order: 1 },
  input: { label: "Input", order: 2 },
  display: { label: "Display", order: 3 },
  artifacts: { label: "Artifacts", order: 4 },
  confirmation: { label: "Confirmation", order: 5 },
  media: { label: "Media", order: 6 },
};

export interface ComponentMeta {
  id: string;
  label: string;
  description: string;
  path: string;
  category: ComponentCategory;
  /** Prompt for npx tool-agent to integrate this component */
  toolAgentPrompt: string;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "approval-card",
    label: "Approval Card",
    description: "Binary confirmation for agent actions",
    path: "/docs/approval-card",
    category: "confirmation",
    toolAgentPrompt:
      "integrate the approval card component for binary confirmation of agent actions",
  },
  {
    id: "chart",
    label: "Chart",
    description: "Visualize data with interactive charts",
    path: "/docs/chart",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the chart component to visualize data with interactive charts",
  },
  {
    id: "citation",
    label: "Citation",
    description: "Display source references with attribution",
    path: "/docs/citation",
    category: "display",
    toolAgentPrompt:
      "integrate the citation component to display source references with attribution",
  },
  {
    id: "code-block",
    label: "Code Block",
    description: "Display syntax-highlighted code snippets",
    path: "/docs/code-block",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the code block component for syntax-highlighted code snippets",
  },
  {
    id: "code-diff",
    label: "Code Diff",
    description: "Compare code changes with syntax-highlighted diffs",
    path: "/docs/code-diff",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the code diff component to compare code changes with syntax-highlighted diffs",
  },
  {
    id: "data-table",
    label: "Data Table",
    description: "Present structured data in sortable tables",
    path: "/docs/data-table",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the data table component to present structured data in sortable tables",
  },
  {
    id: "geo-map",
    label: "Geo Map",
    description: "Display geolocated entities and fleet positions",
    path: "/docs/geo-map",
    category: "display",
    toolAgentPrompt:
      "integrate the geo map component to display geolocated entities and fleet positions",
  },
  {
    id: "image",
    label: "Image",
    description: "Display images with metadata and attribution",
    path: "/docs/image",
    category: "media",
    toolAgentPrompt:
      "integrate the image component to display images with metadata and attribution",
  },
  {
    id: "image-gallery",
    label: "Image Gallery",
    description: "Masonry grid with fullscreen lightbox viewer",
    path: "/docs/image-gallery",
    category: "media",
    toolAgentPrompt:
      "integrate the image gallery component with masonry grid and lightbox viewer",
  },
  {
    id: "video",
    label: "Video",
    description: "Video playback with controls and poster",
    path: "/docs/video",
    category: "media",
    toolAgentPrompt:
      "integrate the video component for video playback with controls and poster",
  },
  {
    id: "audio",
    label: "Audio",
    description: "Audio playback with artwork and metadata",
    path: "/docs/audio",
    category: "media",
    toolAgentPrompt:
      "integrate the audio component for audio playback with artwork and metadata",
  },
  {
    id: "link-preview",
    label: "Link Preview",
    description: "Rich link previews with Open Graph data",
    path: "/docs/link-preview",
    category: "display",
    toolAgentPrompt:
      "integrate the link preview component for rich link previews with Open Graph data",
  },
  {
    id: "message-draft",
    label: "Message Draft",
    description: "Review and approve messages before sending",
    path: "/docs/message-draft",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the message draft component to review and approve messages before sending",
  },
  {
    id: "option-list",
    label: "Option List",
    description: "Let users select from multiple choices",
    path: "/docs/option-list",
    category: "input",
    toolAgentPrompt:
      "integrate the option list component to let users select from multiple choices",
  },
  {
    id: "order-summary",
    label: "Order Summary",
    description: "Display purchases with itemized pricing",
    path: "/docs/order-summary",
    category: "confirmation",
    toolAgentPrompt:
      "integrate the order summary component to display purchases with itemized pricing",
  },
  {
    id: "parameter-slider",
    label: "Parameter Slider",
    description: "Numeric parameter adjustment controls",
    path: "/docs/parameter-slider",
    category: "input",
    toolAgentPrompt:
      "integrate the parameter slider component for numeric parameter adjustment controls",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Step-by-step task workflows with status tracking",
    path: "/docs/plan",
    category: "progress",
    toolAgentPrompt:
      "integrate the plan component for step-by-step task workflows with status tracking",
  },
  {
    id: "preferences-panel",
    label: "Preferences Panel",
    description: "Compact settings panel for user preferences",
    path: "/docs/preferences-panel",
    category: "input",
    toolAgentPrompt:
      "integrate the preferences panel component for compact user settings",
  },
  {
    id: "progress-tracker",
    label: "Progress Tracker",
    description: "Real-time status feedback for multi-step operations",
    path: "/docs/progress-tracker",
    category: "progress",
    toolAgentPrompt:
      "integrate the progress tracker component for real-time status feedback on multi-step operations",
  },
  {
    id: "item-carousel",
    label: "Item Carousel",
    description: "Horizontal carousel for browsing collections",
    path: "/docs/item-carousel",
    category: "display",
    toolAgentPrompt:
      "integrate the item carousel component for horizontal browsing of collections",
  },
  {
    id: "instagram-post",
    label: "Instagram Post",
    description: "Render Instagram post previews",
    path: "/docs/instagram-post",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the instagram post component to render Instagram post previews",
  },
  {
    id: "linkedin-post",
    label: "LinkedIn Post",
    description: "Render LinkedIn post previews",
    path: "/docs/linkedin-post",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the linkedin post component to render LinkedIn post previews",
  },
  {
    id: "x-post",
    label: "X Post",
    description: "Render X post previews",
    path: "/docs/x-post",
    category: "artifacts",
    toolAgentPrompt:
      "integrate the x post component to render X/Twitter post previews",
  },
  {
    id: "stats-display",
    label: "Stats Display",
    description: "Key metrics and KPIs in a visual grid",
    path: "/docs/stats-display",
    category: "display",
    toolAgentPrompt:
      "integrate the stats display component for key metrics and KPIs in a visual grid",
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Show command-line output and logs",
    path: "/docs/terminal",
    category: "display",
    toolAgentPrompt:
      "integrate the terminal component to show command-line output and logs",
  },
  {
    id: "question-flow",
    label: "Question Flow",
    description: "Multi-step guided questions with branching",
    path: "/docs/question-flow",
    category: "input",
    toolAgentPrompt:
      "integrate the question flow component for multi-step guided questions with branching",
  },
  {
    id: "weather-widget",
    label: "Weather Widget",
    description: "Probably more weather widget than anyone asked for",
    path: "/docs/weather-widget",
    category: "display",
    toolAgentPrompt:
      "integrate the weather widget component for weather display with forecasts and conditions",
  },
];

export const componentsByCategory = new Map<
  ComponentCategory,
  ComponentMeta[]
>();
for (const component of componentsRegistry) {
  const arr = componentsByCategory.get(component.category) || [];
  arr.push(component);
  componentsByCategory.set(component.category, arr);
}
