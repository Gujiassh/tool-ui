import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const OUTPUT_PATH = path.join(
  process.cwd(),
  "components/tool-ui/weather-widget/effects/tuned-presets.ts",
);

type Edit = { type: "equal" | "insert" | "delete"; line: string };

function diffLines(a: string[], b: string[]): Edit[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const trace: Array<Map<number, number>> = [];
  let v = new Map<number, number>();
  v.set(1, 0);

  for (let d = 0; d <= max; d += 1) {
    const vNext = new Map<number, number>();
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))) {
        x = v.get(k + 1) ?? 0;
      } else {
        x = (v.get(k - 1) ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      vNext.set(k, x);
      if (x >= n && y >= m) {
        trace.push(vNext);
        return buildEdits(trace, a, b);
      }
    }
    trace.push(vNext);
    v = vNext;
  }

  return [];
}

function buildEdits(
  trace: Array<Map<number, number>>,
  a: string[],
  b: string[],
): Edit[] {
  const edits: Edit[] = [];
  let x = a.length;
  let y = b.length;

  for (let d = trace.length - 1; d >= 0; d -= 1) {
    const v = trace[d];
    const k = x - y;
    let prevK: number;
    if (
      k === -d ||
      (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))
    ) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      edits.push({ type: "equal", line: a[x - 1] });
      x -= 1;
      y -= 1;
    }

    if (d === 0) break;

    if (x === prevX) {
      edits.push({ type: "insert", line: b[y - 1] });
      y -= 1;
    } else {
      edits.push({ type: "delete", line: a[x - 1] });
      x -= 1;
    }
  }

  return edits.reverse();
}

function formatDiff(edits: Edit[], maxLines: number) {
  const lines = edits.map((edit) => {
    const prefix =
      edit.type === "insert" ? "+" : edit.type === "delete" ? "-" : " ";
    return `${prefix}${edit.line}`;
  });

  const truncated = lines.length > maxLines;
  return {
    diff: lines.slice(0, maxLines).join("\n"),
    truncated,
  };
}

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

  let existing = "";
  try {
    existing = await readFile(OUTPUT_PATH, "utf8");
  } catch {
    existing = "";
  }

  if (existing === payload.content) {
    return Response.json({ changed: false, diff: "", truncated: false });
  }

  const edits = diffLines(existing.split("\n"), payload.content.split("\n"));
  const formatted = formatDiff(edits, 400);
  return Response.json({
    changed: true,
    diff: formatted.diff,
    truncated: formatted.truncated,
  });
}
