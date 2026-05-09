import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { LinkValue } from "@/components/tool-ui/data-table/formatters";
import { ImageGallery } from "@/components/tool-ui/image-gallery";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { XPost } from "@/components/tool-ui/x-post";

describe("tool-ui social/media link sanitization", () => {
  test("does not render unsafe X post link-preview href", () => {
    const html = renderToStaticMarkup(
      createElement(XPost, {
        post: {
          id: "x-1",
          author: {
            name: "Ada Lovelace",
            handle: "ada",
            avatarUrl: "https://example.com/avatar.png",
          },
          linkPreview: {
            url: "javascript:alert(1)",
            title: "unsafe",
          },
        },
      }),
    );

    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  test("does not render unsafe LinkedIn link-preview href", () => {
    const html = renderToStaticMarkup(
      createElement(LinkedInPost, {
        post: {
          id: "li-1",
          author: {
            name: "Grace Hopper",
            avatarUrl: "https://example.com/avatar.png",
          },
          linkPreview: {
            url: "javascript:alert(1)",
            title: "unsafe",
          },
        },
      }),
    );

    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  test("does not render unsafe ImageGallery source href", () => {
    const html = renderToStaticMarkup(
      createElement(ImageGallery, {
        id: "gallery-1",
        images: [
          {
            id: "img-1",
            src: "https://example.com/image.jpg",
            alt: "Image",
            width: 1200,
            height: 800,
            source: {
              label: "Unsafe source",
              url: "javascript:alert(1)",
            },
          },
        ],
      }),
    );

    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  test("does not render unsafe DataTable link href", () => {
    const html = renderToStaticMarkup(
      createElement(LinkValue, {
        value: "Click me",
        row: { target: "javascript:alert(1)" },
        options: { kind: "link", hrefKey: "target", external: true },
      }),
    );

    expect(html).not.toContain('href="javascript:alert(1)"');
  });
});
