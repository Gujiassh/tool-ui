import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  BadgeCheck,
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleCheck,
  CloudSun,
  Code,
  Copy,
  DollarSign,
  Download,
  Expand,
  ExternalLink,
  Eye,
  FileCode,
  FileOutput,
  FileText,
  FoldVertical,
  GalleryHorizontalEnd,
  Globe,
  Grid2x2,
  Hash,
  Headphones,
  HelpCircle,
  Highlighter,
  Image,
  Images,
  Keyboard,
  Layers,
  LineChart,
  Link,
  List,
  ListChecks,
  ListTodo,
  MapPin,
  Maximize2,
  MessageSquare,
  Moon,
  MousePointerClick,
  Move,
  Network,
  Package,
  Paintbrush,
  Palette,
  PartyPopper,
  Play,
  PlusCircle,
  Quote,
  Ratio,
  Rocket,
  Route,
  ScanSearch,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  SquareCheck,
  Table2,
  Target,
  Terminal,
  Thermometer,
  Timer,
  Video,
} from "lucide-react";
import { cn } from "@/lib/ui/cn";

const ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Copy,
  Hash,
  Highlighter,
  FoldVertical,
  FileCode,
  FileText,
  Moon,
  BarChart3,
  LineChart,
  MousePointerClick,
  CircleCheck,
  CheckCircle2,
  ListChecks,
  Settings2,
  SquareCheck,
  Paintbrush,
  Terminal,
  Timer,
  AlertCircle,
  AlertTriangle,
  Code,
  FileOutput,
  Smartphone,
  ArrowUpDown,
  Table2,
  Accessibility,
  Link,
  Image,
  Video,
  Headphones,
  Download,
  Expand,
  PartyPopper,
  HelpCircle,
  Layers,
  Play,
  Eye,
  Maximize2,
  ListTodo,
  List,
  GalleryHorizontalEnd,
  Keyboard,
  Globe,
  ExternalLink,
  AspectRatio: Ratio,
  Quote,
  ShieldCheck,
  Target,
  MessageSquare,
  BadgeCheck,
  Images,
  Network,
  Route,
  ScanSearch,
  Rocket,
  DollarSign,
  Package,
  Grid2x2,
  Move,
  PlusCircle,
  SlidersHorizontal,
  CloudSun,
  MapPin,
  Thermometer,
  Calendar,
};

interface FeatureGridProps {
  children: React.ReactNode;
  className?: string;
}

export function FeatureGrid({ children, className }: FeatureGridProps) {
  return (
    <div
      className={cn(
        "not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FeatureProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Feature({ icon, title, children, className }: FeatureProps) {
  const IconComponent = ICON_MAP[icon] ?? HelpCircle;

  return (
    <div
      className={cn(
        "flex min-h-26 flex-col justify-between gap-3 rounded-xl border border-border/50 bg-muted/50 p-4",
        className,
      )}
    >
      <IconComponent className="h-5 w-5 text-muted-foreground" />
      <div>
        <div className="text-pretty font-semibold leading-none">{title}</div>
        <div className="mt-1.5 text-pretty text-muted-foreground text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
