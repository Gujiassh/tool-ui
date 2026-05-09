/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn    → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Chart → shadcn/ui Chart (recharts wrapper)
 *   Card  → shadcn/ui Card
 */

export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export { cn } from "@/lib/utils";
