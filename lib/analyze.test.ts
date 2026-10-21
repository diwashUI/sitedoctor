import { describe, expect, it } from "vitest";
import {
  analyzeAccessibility,
  analyzeLinks,
  analyzePerformance,
  analyzeSecurityHeaders,
  analyzeSeo,
  buildReport,
  gradeFor,
  overallScore,
  scoreChecks,
  type CheckResult,
  type ParsedPage,
} from "./analyze";

function basePage(overrides: Partial<ParsedPage> = {}): ParsedPage {
  return {
    title: "A perfectly reasonable page title here",
    metaDescription:
      "A fine meta description that sits comfortably between fifty and one hundred sixty characters long.",
    ogTags: { title: true, description: true, image: true },
    h1Count: 1,
    hasCanonical: true,
    htmlLang: "en",
    images: [{ src: "a.png", alt: "a photo", width: "100", height: "100" }],
    inputs: [],
    buttons: [{ text: "Submit", ariaLabel: null }],
    headScripts: [],
    stylesheets: 1,
    ...overrides,
  };
}

function sev(checks: CheckResult[], id: string) {
  return checks.find((c) => c.id === id)!.severity;
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

describe("analyzeSeo", () => {
  it("fails when the title is missing", () => {
    expect(sev(analyzeSeo(basePage({ title: null })), "seo-title")).toBe("fail");
  });

  it("passes with a well-sized title", () => {
    expect(sev(analyzeSeo(basePage()), "seo-title")).toBe("pass");
  });

  it("warns on a very short title", () => {
    expect(sev(analyzeSeo(basePage({ title: "Hi" })), "seo-title")).toBe("warn");
  });

  it("warns on an overlong title", () => {
    expect(sev(analyzeSeo(basePage({ title: "x".repeat(80) })), "seo-title")).toBe("warn");
  });

  it("fails when the meta description is missing", () => {
    expect(sev(analyzeSeo(basePage({ metaDescription: null })), "seo-description")).toBe("fail");
  });

  it("fails when no Open Graph tags exist", () => {
    const p = basePage({ ogTags: { title: false, description: false, image: false } });
    expect(sev(analyzeSeo(p), "seo-og")).toBe("fail");
  });

  it("warns on partial Open Graph tags and names the missing ones", () => {
    const p = basePage({ ogTags: { title: true, description: false, image: false } });
    const check = analyzeSeo(p).find((c) => c.id === "seo-og")!;
    expect(check.severity).toBe("warn");
    expect(check.summary).toContain("og:description");
  });

  it("fails with zero H1s", () => {
    expect(sev(analyzeSeo(basePage({ h1Count: 0 })), "seo-h1")).toBe("fail");
  });

  it("warns with multiple H1s", () => {
    expect(sev(analyzeSeo(basePage({ h1Count: 3 })), "seo-h1")).toBe("warn");
  });

  it("warns when the canonical link is missing", () => {
    expect(sev(analyzeSeo(basePage({ hasCanonical: false })), "seo-canonical")).toBe("warn");
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe("analyzeAccessibility", () => {
  it("fails when an image has no alt attribute", () => {
    const p = basePage({ images: [{ src: "a.png", alt: null, width: "10", height: "10" }] });
    const check = analyzeAccessibility(p).find((c) => c.id === "a11y-img-alt")!;
    expect(check.severity).toBe("fail");
    expect(check.details?.[0]).toBe("a.png");
  });

  it("treats empty alt as valid (decorative image)", () => {
    const p = basePage({ images: [{ src: "a.png", alt: "", width: "10", height: "10" }] });
    expect(sev(analyzeAccessibility(p), "a11y-img-alt")).toBe("pass");
  });

  it("fails for an unlabeled text input", () => {
    const p = basePage({
      inputs: [{ type: "text", id: "q", ariaLabel: null, ariaLabelledby: null, hasLabelFor: false, wrappedInLabel: false }],
    });
    expect(sev(analyzeAccessibility(p), "a11y-input-labels")).toBe("fail");
  });

  it("passes when the input has a matching label", () => {
    const p = basePage({
      inputs: [{ type: "text", id: "q", ariaLabel: null, ariaLabelledby: null, hasLabelFor: true, wrappedInLabel: false }],
    });
    expect(sev(analyzeAccessibility(p), "a11y-input-labels")).toBe("pass");
  });

  it("ignores hidden inputs", () => {
    const p = basePage({
      inputs: [{ type: "hidden", id: null, ariaLabel: null, ariaLabelledby: null, hasLabelFor: false, wrappedInLabel: false }],
    });
    expect(sev(analyzeAccessibility(p), "a11y-input-labels")).toBe("pass");
  });

  it("fails when html lang is missing", () => {
    expect(sev(analyzeAccessibility(basePage({ htmlLang: null })), "a11y-html-lang")).toBe("fail");
  });

  it("fails for an icon-only button with no name", () => {
    const p = basePage({ buttons: [{ text: "", ariaLabel: null }] });
    expect(sev(analyzeAccessibility(p), "a11y-button-names")).toBe("fail");
  });

  it("passes for a button with an aria-label", () => {
    const p = basePage({ buttons: [{ text: "", ariaLabel: "Close menu" }] });
    expect(sev(analyzeAccessibility(p), "a11y-button-names")).toBe("pass");
  });
});

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

describe("analyzePerformance", () => {
  const meta = { ttfbMs: 200, htmlBytes: 40 * 1024 };

  it("passes on fast TTFB", () => {
    expect(sev(analyzePerformance(basePage(), meta), "perf-ttfb")).toBe("pass");
  });

  it("warns on slow TTFB", () => {
    expect(sev(analyzePerformance(basePage(), { ...meta, ttfbMs: 1200 }), "perf-ttfb")).toBe("warn");
  });

  it("fails on very slow TTFB", () => {
    expect(sev(analyzePerformance(basePage(), { ...meta, ttfbMs: 3000 }), "perf-ttfb")).toBe("fail");
  });

  it("fails on a huge HTML payload", () => {
    expect(
      sev(analyzePerformance(basePage(), { ...meta, htmlBytes: 800 * 1024 }), "perf-html-size"),
    ).toBe("fail");
  });

  it("warns when images lack dimensions", () => {
    const p = basePage({ images: [{ src: "a.png", alt: "x", width: null, height: null }] });
    const check = analyzePerformance(p, meta).find((c) => c.id === "perf-img-dims")!;
    expect(check.severity).toBe("warn");
    expect(check.details?.[0]).toBe("a.png");
  });

  it("fails with many render-blocking resources", () => {
    const p = basePage({
      headScripts: Array.from({ length: 4 }, (_, i) => ({ src: `s${i}.js`, defer: false, async: false })),
      stylesheets: 3,
    });
    expect(sev(analyzePerformance(p, meta), "perf-render-blocking")).toBe("fail");
  });

  it("ignores deferred scripts when counting render-blocking", () => {
    const p = basePage({
      headScripts: [{ src: "s.js", defer: true, async: false }],
      stylesheets: 0,
    });
    expect(sev(analyzePerformance(p, meta), "perf-render-blocking")).toBe("pass");
  });
});

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

describe("analyzeLinks", () => {
  it("fails when a link is broken and lists it", () => {
    const check = analyzeLinks([
      { url: "https://x.test/ok", ok: true, status: 200 },
      { url: "https://x.test/gone", ok: true, status: 404 },
    ])[0];
    expect(check.severity).toBe("fail");
    expect(check.details?.[0]).toContain("https://x.test/gone");
  });

  it("passes when all links work", () => {
    expect(analyzeLinks([{ url: "https://x.test/ok", ok: true, status: 200 }])[0].severity).toBe("pass");
  });

  it("warns when a link could not be reached", () => {
    expect(
      analyzeLinks([{ url: "https://x.test/slow", ok: false, status: null }])[0].severity,
    ).toBe("warn");
  });

  it("passes when there are no links to check", () => {
    expect(analyzeLinks([])[0].severity).toBe("pass");
  });
});

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

describe("analyzeSecurityHeaders", () => {
  const full = {
    "strict-transport-security": "max-age=31536000",
    "content-security-policy": "default-src 'self'",
    "x-frame-options": "SAMEORIGIN",
    "referrer-policy": "strict-origin-when-cross-origin",
  };

  it("fails plain HTTP", () => {
    const checks = analyzeSecurityHeaders({}, "http://x.test/");
    expect(checks.find((c) => c.id === "sec-https")!.severity).toBe("fail");
  });

  it("warns on each missing header", () => {
    const checks = analyzeSecurityHeaders({}, "https://x.test/");
    for (const id of ["sec-hsts", "sec-csp", "sec-frame", "sec-referrer"]) {
      expect(checks.find((c) => c.id === id)!.severity).toBe("warn");
    }
  });

  it("passes when all headers are present (case-insensitive)", () => {
    const mixed: Record<string, string> = {};
    for (const [k, v] of Object.entries(full)) mixed[k.toUpperCase()] = v;
    const checks = analyzeSecurityHeaders(mixed, "https://x.test/");
    expect(checks.every((c) => c.severity === "pass")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function mkCheck(severity: CheckResult["severity"]): CheckResult {
  return { id: "t", category: "seo", title: "t", severity, summary: "", fix: "" };
}

describe("scoring", () => {
  it("scores all-pass as 100", () => {
    expect(scoreChecks([mkCheck("pass"), mkCheck("pass")])).toBe(100);
  });

  it("averages mixed severities", () => {
    // (100 + 60 + 20) / 3 = 60
    expect(scoreChecks([mkCheck("pass"), mkCheck("warn"), mkCheck("fail")])).toBe(60);
  });

  it("weights categories for the overall score", () => {
    const cats = [
      { id: "performance" as const, label: "p", score: 100, checks: [] },
      { id: "seo" as const, label: "s", score: 0, checks: [] },
      { id: "accessibility" as const, label: "a", score: 0, checks: [] },
      { id: "links" as const, label: "l", score: 0, checks: [] },
      { id: "security" as const, label: "s", score: 0, checks: [] },
    ];
    // performance weight 0.3 -> 30
    expect(overallScore(cats)).toBe(30);
  });

  it("grades boundaries correctly", () => {
    expect(gradeFor(95)).toBe("Excellent");
    expect(gradeFor(70)).toBe("Good");
    expect(gradeFor(50)).toBe("Needs work");
    expect(gradeFor(20)).toBe("Poor");
  });

  it("buildReport assembles categories with labels and scores", () => {
    const report = buildReport({
      url: "https://x.test/",
      finalUrl: "https://x.test/",
      categories: [{ id: "seo", checks: [mkCheck("pass")] }],
      meta: { ttfbMs: 1, htmlBytes: 1, totalMs: 1, linksChecked: 0 },
    });
    expect(report.categories[0].label).toBe("SEO");
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(typeof report.analyzedAt).toBe("string");
  });
});
