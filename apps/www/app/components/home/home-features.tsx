import { Code2, Layers, ShieldCheck, Zap } from "lucide-react";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Code2,
    title: "Copy & paste",
    description:
      "Components live in your repo. Read the source, modify freely, no upstream surprises.",
  },
  {
    icon: Layers,
    title: "JSON-native",
    description:
      "Every component has a Zod schema. Tools return JSON, components render. Parsing fails safely.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible by default",
    description:
      "Built on Radix primitives. Keyboard navigation, screen reader support, focus management.",
  },
  {
    icon: Zap,
    title: "Zero new dependencies",
    description:
      "Only requires what shadcn/ui already needs. Tailwind, Radix, Lucide. Nothing else.",
  },
];

export function HomeFeatures() {
  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex flex-col gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h3 className="text-[15px] font-medium tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-[13px] leading-[1.6] text-muted-foreground">
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}
