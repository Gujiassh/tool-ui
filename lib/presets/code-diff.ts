import type { SerializableCodeDiff } from "@/components/tool-ui/code-diff";
import type { PresetWithCodeGen } from "./types";

export type CodeDiffPresetName =
  | "refactor"
  | "bug-fix"
  | "new-code"
  | "config-change"
  | "patch"
  | "split";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
}

function generateCodeDiffCode(data: SerializableCodeDiff): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.language && data.language !== "text") {
    props.push(`  language="${data.language}"`);
  }

  if (data.filename) {
    props.push(`  filename="${data.filename}"`);
  }

  if (data.maxCollapsedLines) {
    props.push(`  maxCollapsedLines={${data.maxCollapsedLines}}`);
  }

  if (data.diffStyle && data.diffStyle !== "unified") {
    props.push(`  diffStyle="${data.diffStyle}"`);
  }

  if (data.patch) {
    props.push(`  patch={\`${escape(data.patch)}\`}`);
  } else {
    if (data.oldCode) {
      props.push(`  oldCode={\`${escape(data.oldCode)}\`}`);
    }
    if (data.newCode) {
      props.push(`  newCode={\`${escape(data.newCode)}\`}`);
    }
  }

  return `<CodeDiff.Standard\n${props.join("\n")}\n/>`;
}

export const codeDiffPresets: Record<
  CodeDiffPresetName,
  PresetWithCodeGen<SerializableCodeDiff>
> = {
  refactor: {
    description: "Function rename and restructure",
    data: {
      id: "code-diff-preview-refactor",
      language: "typescript",
      filename: "lib/auth.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: `export function checkAuth(token: string) {
  const decoded = jwt.verify(token, SECRET);
  if (!decoded) {
    throw new Error("Invalid token");
  }
  const user = db.users.find(u => u.id === decoded.sub);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}`,
      newCode: `export function verifySession(token: string): AuthResult {
  const decoded = jwt.verify(token, SECRET);
  if (!decoded) {
    return { ok: false, error: "invalid_token" };
  }

  const user = db.users.findById(decoded.sub);
  if (!user) {
    return { ok: false, error: "user_not_found" };
  }

  return { ok: true, user };
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  "bug-fix": {
    description: "Off-by-one fix in pagination",
    data: {
      id: "code-diff-preview-bug-fix",
      language: "typescript",
      filename: "hooks/use-pagination.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: `export function usePagination(items: unknown[], pageSize: number) {
  const totalPages = Math.floor(items.length / pageSize);
  const [page, setPage] = useState(1);

  const pageItems = items.slice(
    (page - 1) * pageSize,
    page * pageSize - 1
  );

  return { page, totalPages, pageItems, setPage };
}`,
      newCode: `export function usePagination(items: unknown[], pageSize: number) {
  const totalPages = Math.ceil(items.length / pageSize);
  const [page, setPage] = useState(1);

  const pageItems = items.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return { page, totalPages, pageItems, setPage };
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  "new-code": {
    description: "Adding rate limiting middleware",
    data: {
      id: "code-diff-preview-new-code",
      language: "typescript",
      filename: "middleware/rate-limit.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: "",
      newCode: `import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function rateLimit(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  }

  return null;
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  "config-change": {
    description: "Updating TypeScript compiler options",
    data: {
      id: "code-diff-preview-config",
      language: "json",
      filename: "tsconfig.json",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: `{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}`,
      newCode: `{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts"]
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  patch: {
    description: "Unified diff from a pull request",
    data: {
      id: "code-diff-preview-patch",
      language: "typescript",
      filename: "api/routes.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      patch: `@@ -14,8 +14,12 @@ export function registerRoutes(app: Express) {
   app.get("/api/users", listUsers);
   app.get("/api/users/:id", getUser);
   app.post("/api/users", createUser);
-  app.put("/api/users/:id", updateUser);
+  app.patch("/api/users/:id", updateUser);
   app.delete("/api/users/:id", deleteUser);
+
+  // Health check
+  app.get("/healthz", (_req, res) => {
+    res.json({ status: "ok", uptime: process.uptime() });
+  });
 }`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  split: {
    description: "Side-by-side view of a function extraction",
    data: {
      id: "code-diff-preview-split",
      language: "typescript",
      filename: "utils/format.ts",
      lineNumbers: "visible",
      diffStyle: "split",
      oldCode: `export function formatUser(user: User): string {
  const name = user.firstName + " " + user.lastName;
  const role = user.isAdmin ? "Admin" : "Member";
  const since = new Date(user.createdAt)
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  return \`\${name} (\${role}) — joined \${since}\`;
}`,
      newCode: `function formatName(user: User): string {
  return \`\${user.firstName} \${user.lastName}\`;
}

function formatRole(user: User): string {
  return user.isAdmin ? "Admin" : "Member";
}

function formatJoinDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatUser(user: User): string {
  const name = formatName(user);
  const role = formatRole(user);
  const since = formatJoinDate(user.createdAt);
  return \`\${name} (\${role}) — joined \${since}\`;
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
};
