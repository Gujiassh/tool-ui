import { describe, expect, it } from "vitest";

import { recoverRepoCheckpointOverrides } from "@/app/sandbox/weather-tuning/lib/recover-repo-overrides";

describe("recoverRepoCheckpointOverrides", () => {
  it("returns checkpoint overrides from a successful recover response", async () => {
    const fetchMock: typeof fetch = (async () =>
      ({
        ok: true,
        json: async () => ({
          checkpointOverrides: {
            clear: {
              dawn: { glass: { depth: 12 } },
              noon: {},
              dusk: {},
              midnight: {},
            },
          },
        }),
      }) as Response) as typeof fetch;

    const result = await recoverRepoCheckpointOverrides(fetchMock);
    expect(result?.clear?.dawn?.glass?.depth).toBe(12);
  });

  it("returns null on non-ok response", async () => {
    const fetchMock: typeof fetch = (async () =>
      ({
        ok: false,
        json: async () => ({}),
      }) as Response) as typeof fetch;

    const result = await recoverRepoCheckpointOverrides(fetchMock);
    expect(result).toBeNull();
  });
});
