import {
  generateOgImage,
  size as ogSize,
  contentType as ogContentType,
} from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Agent Skills";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage(
    "Agent Skills",
    "Let your coding agent to the heavy lifting.",
  );
}
