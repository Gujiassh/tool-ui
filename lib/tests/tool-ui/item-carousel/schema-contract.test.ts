import { describe, expect, test } from "vitest";
import {
  parseSerializableItemCarousel,
  safeParseSerializableItemCarousel,
  type SerializableItemCarousel,
} from "@/components/tool-ui/item-carousel/schema";

function makePayload(): SerializableItemCarousel {
  return {
    id: "item-carousel-schema-contract",
    items: [
      {
        id: "item-1",
        name: "First",
        subtitle: "Example",
        color: "#ff0000",
      },
      {
        id: "item-2",
        name: "Second",
        subtitle: "Example",
        color: "#00ff00",
      },
    ],
  };
}

describe("item-carousel schema contract", () => {
  test("rejects duplicate item ids", () => {
    const payload = makePayload();
    payload.items = [payload.items[0], { ...payload.items[0] }];

    expect(() => parseSerializableItemCarousel(payload)).toThrow();
    expect(safeParseSerializableItemCarousel(payload)).toBeNull();
  });

  test("does not include className from serializable payloads", () => {
    const parsed = parseSerializableItemCarousel({
      ...makePayload(),
      className: "bg-red-500",
    });

    expect("className" in (parsed as Record<string, unknown>)).toBe(false);
  });
});
