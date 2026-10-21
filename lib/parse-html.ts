/**
 * Converts raw HTML into the ParsedPage model the analysis engine consumes.
 * DOM-library-specific code lives only here, so the engine stays testable.
 */
import { parse, type HTMLElement } from "node-html-parser";
import type { ParsedPage } from "./analyze";

function attr(el: HTMLElement | null, name: string): string | null {
  if (!el) return null;
  const v = el.getAttribute(name);
  return v === undefined ? null : v;
}

function hasAttr(el: HTMLElement | null, name: string): boolean {
  return attr(el, name) !== null;
}

export function parseHtml(html: string): ParsedPage {
  const root = parse(html);

  const titleEl = root.querySelector("title");
  const title = titleEl ? titleEl.text.trim() || null : null;

  const descEl = root.querySelector('meta[name="description"]');
  const metaDescription = attr(descEl, "content")?.trim() || null;

  const og = (prop: string) =>
    hasAttr(root.querySelector(`meta[property="${prop}"]`), "content");
  const ogTags = {
    title: og("og:title"),
    description: og("og:description"),
    image: og("og:image"),
  };

  const h1Count = root.querySelectorAll("h1").length;
  const hasCanonical = root.querySelector('link[rel="canonical"]') !== null;

  const htmlEl = root.querySelector("html");
  const htmlLang = attr(htmlEl, "lang")?.trim() || null;

  const images = root.querySelectorAll("img").map((img) => ({
    src: attr(img, "src") ?? "",
    alt: attr(img, "alt"),
    width: attr(img, "width"),
    height: attr(img, "height"),
  }));

  // Build a set of label[for] targets for input association.
  const labelFors = new Set(
    root
      .querySelectorAll("label")
      .map((l) => attr(l, "for"))
      .filter((f): f is string => f !== null),
  );

  const inputs = root
    .querySelectorAll("input, select, textarea")
    .map((input) => {
      const id = attr(input, "id");
      // Walk up to see if the input is wrapped in a <label>.
      let wrappedInLabel = false;
      let parent = input.parentNode as HTMLElement | null;
      while (parent) {
        if (parent.tagName === "LABEL") {
          wrappedInLabel = true;
          break;
        }
        parent = parent.parentNode as HTMLElement | null;
      }
      return {
        type: (attr(input, "type") ?? "").toLowerCase(),
        id,
        ariaLabel: attr(input, "aria-label"),
        ariaLabelledby: attr(input, "aria-labelledby"),
        hasLabelFor: id !== null && labelFors.has(id),
        wrappedInLabel,
      };
    });

  const buttons = root.querySelectorAll("button").map((b) => ({
    text: b.text.trim(),
    ariaLabel: attr(b, "aria-label"),
  }));

  const head = root.querySelector("head");
  const headScripts = (head ? head.querySelectorAll("script") : []).map((s) => ({
    src: attr(s, "src"),
    defer: hasAttr(s, "defer"),
    async: hasAttr(s, "async"),
  }));
  const stylesheets = head
    ? head.querySelectorAll('link[rel="stylesheet"]').length
    : 0;

  return {
    title,
    metaDescription,
    ogTags,
    h1Count,
    hasCanonical,
    htmlLang,
    images,
    inputs,
    buttons,
    headScripts,
    stylesheets,
  };
}

/** Extract up to `limit` same-origin absolute link URLs from the page. */
export function extractSameOriginLinks(html: string, baseUrl: string, limit = 20): string[] {
  const root = parse(html);
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of root.querySelectorAll("a")) {
    const href = attr(a, "href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    try {
      const u = new URL(href, base);
      if (u.protocol !== "http:" && u.protocol !== "https:") continue;
      if (u.hostname !== base.hostname) continue;
      const normalized = u.href;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        out.push(normalized);
        if (out.length >= limit) break;
      }
    } catch {
      // ignore malformed URLs
    }
  }
  return out;
}
