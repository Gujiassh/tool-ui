import { writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const OUTPUT_PATH = path.join(
  process.cwd(),
  "components/tool-ui/weather-widget/effects/tuned-presets.ts",
);

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Disabled in production.", { status: 403 });
  }

  let payload: { content?: string } | null = null;
  try {
    payload = (await request.json()) as { content?: string };
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  if (!payload?.content || typeof payload.content !== "string") {
    return new Response("Missing 'content' field.", { status: 400 });
  }

  await writeFile(OUTPUT_PATH, payload.content, "utf8");
  return Response.json({
    ok: true,
    path: "components/tool-ui/weather-widget/effects/tuned-presets.ts",
  });
}
