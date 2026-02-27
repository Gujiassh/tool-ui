import { afterEach, beforeEach, vi } from "vitest";

const ALLOWED_PATTERNS: RegExp[] = [];

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

function toMessage(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}`;
      }
      if (typeof arg === "string") {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

function isAllowedMessage(message: string): boolean {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(message));
}

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const errorMessages = consoleErrorSpy.mock.calls.map((call: unknown[]) =>
    toMessage(call),
  );
  const warnMessages = consoleWarnSpy.mock.calls.map((call: unknown[]) =>
    toMessage(call),
  );
  const unexpectedMessages = [...errorMessages, ...warnMessages].filter(
    (message) => !isAllowedMessage(message),
  );

  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();

  if (unexpectedMessages.length > 0) {
    throw new Error(
      [
        "Unexpected console warnings/errors detected during test:",
        ...unexpectedMessages.map((message) => `- ${message}`),
      ].join("\n"),
    );
  }
});
