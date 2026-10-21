/**
 * SiteDoctor analysis engine.
 *
 * All check logic lives in pure functions that take parsed data in and
 * return CheckResults — no fetching here, so every rule is unit-testable
 * against fixture HTML strings. Fetching + orchestration happens in
 * app/api/analyze/route.ts.
 */

export type Severity = "pass" | "warn" | "fail";
export type CategoryId =
  | "performance"
  | "seo"
  | "accessibility"
  | "links"
  | "security";

export interface CheckResult {
  id: string;
  category: CategoryId;
  title: string;
  severity: Severity;
  /** Plain-language explanation of what was found. */
  summary: string;
  /** How to fix it, in plain words. */
  fix: string;
  /** Optional specifics, e.g. the broken URLs or offending elements. */
  details?: string[];
}

export interface CategoryScore {
  id: CategoryId;
  label: string;
  score: number; // 0-100
  checks: CheckResult[];
}

export interface AnalysisReport {
  url: string;
  finalUrl: string;
  score: number; // 0-100 overall
  grade: string;
  categories: CategoryScore[];
  meta: {
    ttfbMs: number;
    htmlBytes: number;
    totalMs: number;
    linksChecked: number;
  };
  analyzedAt: string;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const CHECK_POINTS: Record<Severity, number> = { pass: 100, warn: 60, fail: 20 };

export function scoreChecks(checks: CheckResult[]): number {
  if (checks.length === 0) return 100;
  const total = checks.reduce((sum, c) => sum + CHECK_POINTS[c.severity], 0);
  return Math.round(total / checks.length);
}

const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  performance: 0.3,
  seo: 0.25,
  accessibility: 0.2,
  links: 0.15,
  security: 0.1,
};

export function overallScore(categories: CategoryScore[]): number {
  const total = categories.reduce(
    (sum, c) => sum + c.score * (CATEGORY_WEIGHTS[c.id] ?? 0),
    0,
  );
  return Math.round(total);
}

export function gradeFor(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

// ---------------------------------------------------------------------------
// Minimal parsed-page model (kept DOM-library-agnostic for testability)
// ---------------------------------------------------------------------------

export interface ParsedPage {
  title: string | null;
  metaDescription: string | null;
  ogTags: { title: boolean; description: boolean; image: boolean };
  h1Count: number;
  hasCanonical: boolean;
  htmlLang: string | null;
  images: { src: string; alt: string | null; width: string | null; height: string | null }[];
  inputs: {
    type: string;
    id: string | null;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    hasLabelFor: boolean;
    wrappedInLabel: boolean;
  }[];
  buttons: { text: string; ariaLabel: string | null }[];
  headScripts: { src: string | null; defer: boolean; async: boolean }[];
  stylesheets: number;
}

// ---------------------------------------------------------------------------
// SEO checks
// ---------------------------------------------------------------------------

export function analyzeSeo(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];

  // Title
  const title = (page.title ?? "").trim();
  if (!title) {
    checks.push({
      id: "seo-title", category: "seo", title: "Page title", severity: "fail",
      summary: "This page has no <title>. The title is what shows up as the clickable headline in Google results.",
      fix: "Add a descriptive <title> of 30–60 characters, e.g. <title>Fresh Sourdough Daily — Sunrise Bakery, Kathmandu</title>.",
    });
  } else if (title.length < 30 || title.length > 60) {
    checks.push({
      id: "seo-title", category: "seo", title: "Page title", severity: "warn",
      summary: `The title is ${title.length} characters — Google typically shows the first 50–60. Short or very long titles get truncated or rewritten.`,
      fix: "Aim for 30–60 characters with the most important words first.",
    });
  } else {
    checks.push({
      id: "seo-title", category: "seo", title: "Page title", severity: "pass",
      summary: `Title is present and a good length (${title.length} characters).`,
      fix: "Nothing to do.",
    });
  }

  // Meta description
  const desc = (page.metaDescription ?? "").trim();
  if (!desc) {
    checks.push({
      id: "seo-description", category: "seo", title: "Meta description", severity: "fail",
      summary: "No meta description found. Google often shows this text under your link in search results — without it, Google picks random page text.",
      fix: 'Add <meta name="description" content="..."> with a 50–160 character summary of the page.',
    });
  } else if (desc.length < 50 || desc.length > 160) {
    checks.push({
      id: "seo-description", category: "seo", title: "Meta description", severity: "warn",
      summary: `The meta description is ${desc.length} characters. Google truncates around 155–160.`,
      fix: "Keep it between 50 and 160 characters and make it read like ad copy for the page.",
    });
  } else {
    checks.push({
      id: "seo-description", category: "seo", title: "Meta description", severity: "pass",
      summary: `Meta description is present (${desc.length} characters).`,
      fix: "Nothing to do.",
    });
  }

  // Open Graph
  const og = page.ogTags;
  const ogPresent = [og.title, og.description, og.image].filter(Boolean).length;
  if (ogPresent === 0) {
    checks.push({
      id: "seo-og", category: "seo", title: "Social sharing tags", severity: "fail",
      summary: "No Open Graph tags found. When someone shares this page on Facebook, WhatsApp or LinkedIn, it shows up as a bare link with no preview image or description.",
      fix: 'Add og:title, og:description and og:image meta tags so shares render a rich preview card.',
    });
  } else if (ogPresent < 3) {
    const missing = [
      !og.title && "og:title",
      !og.description && "og:description",
      !og.image && "og:image",
    ].filter(Boolean) as string[];
    checks.push({
      id: "seo-og", category: "seo", title: "Social sharing tags", severity: "warn",
      summary: `Some Open Graph tags are present, but missing: ${missing.join(", ")}.`,
      fix: "Add the missing tags so link previews look complete everywhere.",
    });
  } else {
    checks.push({
      id: "seo-og", category: "seo", title: "Social sharing tags", severity: "pass",
      summary: "og:title, og:description and og:image are all present.",
      fix: "Nothing to do.",
    });
  }

  // H1
  if (page.h1Count === 0) {
    checks.push({
      id: "seo-h1", category: "seo", title: "Main heading (H1)", severity: "fail",
      summary: "No H1 heading found. Search engines use the H1 to understand what the page is about.",
      fix: "Add exactly one <h1> describing the page's main topic.",
    });
  } else if (page.h1Count > 1) {
    checks.push({
      id: "seo-h1", category: "seo", title: "Main heading (H1)", severity: "warn",
      summary: `Found ${page.h1Count} H1 headings. A page should have exactly one so search engines know the main topic.`,
      fix: "Keep one <h1> and demote the rest to <h2>.",
    });
  } else {
    checks.push({
      id: "seo-h1", category: "seo", title: "Main heading (H1)", severity: "pass",
      summary: "Exactly one H1 heading.",
      fix: "Nothing to do.",
    });
  }

  // Canonical
  checks.push(
    page.hasCanonical
      ? {
          id: "seo-canonical", category: "seo", title: "Canonical URL", severity: "pass",
          summary: "A canonical link is present, telling search engines which URL is the official one.",
          fix: "Nothing to do.",
        }
      : {
          id: "seo-canonical", category: "seo", title: "Canonical URL", severity: "warn",
          summary: "No canonical link found. If the same content is reachable at multiple URLs, search engines may split ranking between them.",
          fix: 'Add <link rel="canonical" href="https://yoursite.com/this-page"> with the page\u2019s preferred URL.',
        },
  );

  return checks;
}

// ---------------------------------------------------------------------------
// Accessibility checks
// ---------------------------------------------------------------------------

export function analyzeAccessibility(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];

  // Images missing alt
  const missingAlt = page.images.filter((img) => img.alt === null);
  if (missingAlt.length > 0) {
    checks.push({
      id: "a11y-img-alt", category: "accessibility", title: "Image alt text", severity: "fail",
      summary: `${missingAlt.length} image${missingAlt.length === 1 ? " has" : "s have"} no alt attribute. Screen readers skip them silently, so blind visitors miss the content.`,
      fix: 'Add descriptive alt="" text to meaningful images, or alt="" (empty) for purely decorative ones.',
      details: missingAlt.slice(0, 5).map((img) => img.src || "(inline image)"),
    });
  } else {
    checks.push({
      id: "a11y-img-alt", category: "accessibility", title: "Image alt text", severity: "pass",
      summary: page.images.length === 0
        ? "No images on the page."
        : `All ${page.images.length} images have alt attributes.`,
      fix: "Nothing to do.",
    });
  }

  // Form inputs missing labels
  const unlabeled = page.inputs.filter(
    (input) =>
      input.type !== "hidden" &&
      input.type !== "submit" &&
      input.type !== "button" &&
      input.type !== "image" &&
      !input.ariaLabel &&
      !input.ariaLabelledby &&
      !input.hasLabelFor &&
      !input.wrappedInLabel,
  );
  if (unlabeled.length > 0) {
    checks.push({
      id: "a11y-input-labels", category: "accessibility", title: "Form labels", severity: "fail",
      summary: `${unlabeled.length} form field${unlabeled.length === 1 ? " has" : "s have"} no label. Screen-reader users hear just "edit box" with no clue what to type.`,
      fix: 'Pair each field with a <label for="field-id">, or add aria-label="..." to the input.',
      details: unlabeled.slice(0, 5).map((i) => `${i.type || "text"} input${i.id ? ` #${i.id}` : ""}`),
    });
  } else {
    checks.push({
      id: "a11y-input-labels", category: "accessibility", title: "Form labels", severity: "pass",
      summary: page.inputs.length === 0 ? "No form fields on the page." : "All form fields have accessible labels.",
      fix: "Nothing to do.",
    });
  }

  // html lang
  checks.push(
    page.htmlLang
      ? {
          id: "a11y-html-lang", category: "accessibility", title: "Page language", severity: "pass",
          summary: `The page declares its language as "${page.htmlLang}".`,
          fix: "Nothing to do.",
        }
      : {
          id: "a11y-html-lang", category: "accessibility", title: "Page language", severity: "fail",
          summary: 'The <html> tag has no lang attribute. Screen readers guess the pronunciation language and often get it wrong.',
          fix: 'Add lang="en" (or the right language code) to the <html> tag.',
        },
  );

  // Buttons without accessible names
  const nameless = page.buttons.filter((b) => !b.text.trim() && !b.ariaLabel);
  if (nameless.length > 0) {
    checks.push({
      id: "a11y-button-names", category: "accessibility", title: "Button names", severity: "fail",
      summary: `${nameless.length} button${nameless.length === 1 ? " has" : "s have"} no text or label — typically icon-only buttons. Screen readers announce them as just "button".`,
      fix: 'Add aria-label="..." describing the action, e.g. aria-label="Close menu".',
    });
  } else {
    checks.push({
      id: "a11y-button-names", category: "accessibility", title: "Button names", severity: "pass",
      summary: page.buttons.length === 0 ? "No buttons on the page." : "All buttons have accessible names.",
      fix: "Nothing to do.",
    });
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Performance checks (from parsed head + fetch metadata)
// ---------------------------------------------------------------------------

export interface PerfMeta {
  ttfbMs: number;
  htmlBytes: number;
}

export function analyzePerformance(page: ParsedPage, meta: PerfMeta): CheckResult[] {
  const checks: CheckResult[] = [];

  // TTFB
  const ttfb = meta.ttfbMs;
  if (ttfb < 800) {
    checks.push({
      id: "perf-ttfb", category: "performance", title: "Server response (TTFB)", severity: "pass",
      summary: `Server responded in ${ttfb} ms — fast.`,
      fix: "Nothing to do.",
    });
  } else if (ttfb < 1800) {
    checks.push({
      id: "perf-ttfb", category: "performance", title: "Server response (TTFB)", severity: "warn",
      summary: `Server took ${ttfb} ms to respond. Visitors start staring at a blank page past ~1 second.`,
      fix: "Enable caching/CDN, and check slow database queries on the server.",
    });
  } else {
    checks.push({
      id: "perf-ttfb", category: "performance", title: "Server response (TTFB)", severity: "fail",
      summary: `Server took ${ttfb} ms to respond — over half of visitors abandon slow pages.`,
      fix: "This is a hosting/backend issue: add a CDN, enable page caching, and profile slow server code.",
    });
  }

  // HTML size
  const kb = Math.round(meta.htmlBytes / 1024);
  if (meta.htmlBytes < 100 * 1024) {
    checks.push({
      id: "perf-html-size", category: "performance", title: "Page weight (HTML)", severity: "pass",
      summary: `HTML is ${kb} KB — lean.`,
      fix: "Nothing to do.",
    });
  } else if (meta.htmlBytes < 500 * 1024) {
    checks.push({
      id: "perf-html-size", category: "performance", title: "Page weight (HTML)", severity: "warn",
      summary: `HTML is ${kb} KB. Heavy pages parse slowly, especially on phones.`,
      fix: "Trim unused markup and inline SVGs; move big JSON blobs out of the HTML.",
    });
  } else {
    checks.push({
      id: "perf-html-size", category: "performance", title: "Page weight (HTML)", severity: "fail",
      summary: `HTML is ${kb} KB — very heavy. Mobile users on slow networks will wait a long time.`,
      fix: "Drastically reduce markup: paginate long lists, lazy-load below-fold content.",
    });
  }

  // Images missing dimensions (layout shift)
  const noDims = page.images.filter((img) => !img.width || !img.height);
  if (noDims.length === 0) {
    checks.push({
      id: "perf-img-dims", category: "performance", title: "Image dimensions", severity: "pass",
      summary: page.images.length === 0
        ? "No images on the page."
        : "All images declare width and height, so the layout doesn't jump while loading.",
      fix: "Nothing to do.",
    });
  } else {
    checks.push({
      id: "perf-img-dims", category: "performance", title: "Image dimensions", severity: "warn",
      summary: `${noDims.length} image${noDims.length === 1 ? " is" : "s are"} missing width/height. The page layout shifts as each one loads — annoying and hurts search ranking.`,
      fix: "Add width and height attributes (or CSS aspect-ratio) to every <img>.",
      details: noDims.slice(0, 5).map((img) => img.src || "(inline image)"),
    });
  }

  // Render-blocking resources
  const blockingScripts = page.headScripts.filter(
    (s) => s.src && !s.defer && !s.async,
  ).length;
  const blocking = blockingScripts + page.stylesheets;
  if (blocking <= 2) {
    checks.push({
      id: "perf-render-blocking", category: "performance", title: "Render-blocking resources", severity: "pass",
      summary: blocking === 0
        ? "No render-blocking scripts or stylesheets in the <head>."
        : `${blocking} render-blocking resource${blocking === 1 ? "" : "s"} — acceptable.`,
      fix: "Nothing to do.",
    });
  } else if (blocking <= 5) {
    checks.push({
      id: "perf-render-blocking", category: "performance", title: "Render-blocking resources", severity: "warn",
      summary: `${blocking} render-blocking resources in the <head> delay the first paint — the browser waits for each one before showing anything.`,
      fix: "Add defer to non-critical scripts, and inline critical CSS while deferring the rest.",
    });
  } else {
    checks.push({
      id: "perf-render-blocking", category: "performance", title: "Render-blocking resources", severity: "fail",
      summary: `${blocking} render-blocking resources — the page can't show anything until all of these download.`,
      fix: "Defer every script that isn't needed for the first paint; split CSS per page.",
    });
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Link checks (from HEAD-request results)
// ---------------------------------------------------------------------------

export interface LinkCheckInput {
  url: string;
  ok: boolean;       // responded
  status: number | null; // HTTP status, null if the request itself failed
}

export function analyzeLinks(results: LinkCheckInput[]): CheckResult[] {
  const broken = results.filter((r) => r.ok && r.status !== null && r.status >= 400);
  const errored = results.filter((r) => !r.ok);

  if (results.length === 0) {
    return [{
      id: "links-health", category: "links", title: "Link health", severity: "pass",
      summary: "No same-origin links found to check.",
      fix: "Nothing to do.",
    }];
  }

  if (broken.length > 0) {
    return [{
      id: "links-health", category: "links", title: "Link health", severity: "fail",
      summary: `${broken.length} broken link${broken.length === 1 ? "" : "s"} found out of ${results.length} checked. Dead links frustrate visitors and hurt search ranking.`,
      fix: "Fix or remove the broken links listed below.",
      details: broken.slice(0, 10).map((r) => `${r.url} (${r.status})`),
    }];
  }

  if (errored.length > 0) {
    return [{
      id: "links-health", category: "links", title: "Link health", severity: "warn",
      summary: `No broken links, but ${errored.length} link${errored.length === 1 ? "" : "s"} couldn't be reached to verify (network timeout).`,
      fix: "Re-run the scan; if they stay unreachable, check them manually.",
      details: errored.slice(0, 10).map((r) => r.url),
    }];
  }

  return [{
    id: "links-health", category: "links", title: "Link health", severity: "pass",
    summary: `All ${results.length} checked links work.`,
    fix: "Nothing to do.",
  }];
}

// ---------------------------------------------------------------------------
// Security header checks
// ---------------------------------------------------------------------------

export function analyzeSecurityHeaders(
  headers: Record<string, string>,
  finalUrl: string,
): CheckResult[] {
  const h: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) h[k.toLowerCase()] = v;

  const checks: CheckResult[] = [];
  const isHttps = finalUrl.startsWith("https://");

  checks.push(
    isHttps
      ? {
          id: "sec-https", category: "security", title: "HTTPS", severity: "pass",
          summary: "The site is served over HTTPS — traffic is encrypted.",
          fix: "Nothing to do.",
        }
      : {
          id: "sec-https", category: "security", title: "HTTPS", severity: "fail",
          summary: "The site is served over plain HTTP. Passwords, forms and cookies travel unencrypted and browsers flag the page as unsafe.",
          fix: "Get a free certificate (e.g. Let's Encrypt) and redirect all HTTP traffic to HTTPS.",
        },
  );

  const headerChecks: {
    id: string; title: string; key: string; summary: string; fix: string;
  }[] = [
    {
      id: "sec-hsts", title: "HSTS header", key: "strict-transport-security",
      summary: "No Strict-Transport-Security header. Without it, attackers can downgrade visitors to HTTP on first visit.",
      fix: 'Send the header: Strict-Transport-Security: max-age=31536000; includeSubDomains.',
    },
    {
      id: "sec-csp", title: "Content Security Policy", key: "content-security-policy",
      summary: "No Content-Security-Policy header. The page is more exposed to cross-site scripting (XSS) attacks.",
      fix: "Add a CSP that only allows scripts and resources from trusted sources.",
    },
    {
      id: "sec-frame", title: "Clickjacking protection", key: "x-frame-options",
      summary: "No X-Frame-Options header. Other sites could embed this page in an invisible iframe to trick clicks (clickjacking).",
      fix: "Send X-Frame-Options: SAMEORIGIN (or use frame-ancestors in your CSP).",
    },
    {
      id: "sec-referrer", title: "Referrer policy", key: "referrer-policy",
      summary: "No Referrer-Policy header. Browsers may leak the full page URL to other sites when visitors click outbound links.",
      fix: "Send Referrer-Policy: strict-origin-when-cross-origin.",
    },
  ];

  for (const hc of headerChecks) {
    checks.push(
      h[hc.key]
        ? {
            id: hc.id, category: "security", title: hc.title, severity: "pass",
            summary: `${hc.title} is set.`,
            fix: "Nothing to do.",
          }
        : { id: hc.id, category: "security", title: hc.title, severity: "warn", summary: hc.summary, fix: hc.fix },
    );
  }

  return checks;
}

// ---------------------------------------------------------------------------
// Report assembly
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<CategoryId, string> = {
  performance: "Performance",
  seo: "SEO",
  accessibility: "Accessibility",
  links: "Links",
  security: "Security",
};

export function buildReport(args: {
  url: string;
  finalUrl: string;
  categories: { id: CategoryId; checks: CheckResult[] }[];
  meta: AnalysisReport["meta"];
}): AnalysisReport {
  const categories: CategoryScore[] = args.categories.map((c) => ({
    id: c.id,
    label: CATEGORY_LABELS[c.id],
    score: scoreChecks(c.checks),
    checks: c.checks,
  }));
  const score = overallScore(categories);
  return {
    url: args.url,
    finalUrl: args.finalUrl,
    score,
    grade: gradeFor(score),
    categories,
    meta: args.meta,
    analyzedAt: new Date().toISOString(),
  };
}
