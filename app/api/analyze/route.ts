import { NextRequest, NextResponse } from "next/server";
import {
  analyzeAccessibility,
  analyzeLinks,
  analyzePerformance,
  analyzeSecurityHeaders,
  analyzeSeo,
  buildReport,
  type LinkCheckInput,
} from "@/lib/analyze";
import { extractSameOriginLinks, parseHtml } from "@/lib/parse-html";

export const maxDuration = 60;

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const LINK_TIMEOUT_MS = 8_000;
const LINK_CONCURRENCY = 5;
const MAX_LINKS = 20;

// ---------------------------------------------------------------------------
// URL validation + SSRF guard
// ---------------------------------------------------------------------------

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  const m = h.match(/^172\.(\d+)\./);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  return false;
}

function normalizeUrl(raw: string): URL | null {
  let input = raw.trim();
  if (!input) return null;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)) input = "https://" + input;
  try {
    const u = new URL(input);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (isBlockedHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetching with timeout + size cap
// ---------------------------------------------------------------------------

interface FetchedPage {
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
  ttfbMs: number;
  totalMs: number;
}

async function fetchPage(url: URL): Promise<FetchedPage> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "SiteDoctor/1.0 (+https://sitedoctorapp.vercel.app) website health auditor",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const ttfbMs = Date.now() - start;

    if (!res.ok) {
      throw new Error(`The site returned HTTP ${res.status}.`);
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml/.test(contentType)) {
      throw new Error("That URL doesn't serve an HTML page (SiteDoctor analyzes websites).");
    }

    // Stream with a size cap.
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > MAX_HTML_BYTES) {
          reader.cancel();
          throw new Error("The page is larger than 2 MB — too big to analyze.");
        }
        chunks.push(value);
      }
    }
    const html = Buffer.concat(chunks).toString("utf-8");
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    return {
      finalUrl: res.url || url.href,
      html,
      headers,
      ttfbMs,
      totalMs: Date.now() - start,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("The site took too long to respond (15s timeout).");
    }
    throw err instanceof Error ? err : new Error("Could not fetch the site.");
  } finally {
    clearTimeout(timeout);
  }
}

async function checkOneLink(url: string): Promise<LinkCheckInput> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": "SiteDoctor/1.0 link checker" },
    });
    return { url, ok: true, status: res.status };
  } catch {
    return { url, ok: false, status: null };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkLinks(urls: string[]): Promise<LinkCheckInput[]> {
  const results: LinkCheckInput[] = [];
  for (let i = 0; i < urls.length; i += LINK_CONCURRENCY) {
    const batch = urls.slice(i, i + LINK_CONCURRENCY);
    const batchResults = await Promise.all(batch.map(checkOneLink));
    results.push(...batchResults);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  const url = normalizeUrl(raw);

  if (!url) {
    return NextResponse.json(
      { error: "Please enter a valid website URL, e.g. example.com." },
      { status: 400 },
    );
  }

  try {
    const page = await fetchPage(url);
    const parsed = parseHtml(page.html);

    const linkUrls = extractSameOriginLinks(page.html, page.finalUrl, MAX_LINKS);
    const linkResults = await checkLinks(linkUrls);

    const categories = [
      { id: "performance" as const, checks: analyzePerformance(parsed, { ttfbMs: page.ttfbMs, htmlBytes: Buffer.byteLength(page.html) }) },
      { id: "seo" as const, checks: analyzeSeo(parsed) },
      { id: "accessibility" as const, checks: analyzeAccessibility(parsed) },
      { id: "links" as const, checks: analyzeLinks(linkResults) },
      { id: "security" as const, checks: analyzeSecurityHeaders(page.headers, page.finalUrl) },
    ];

    const report = buildReport({
      url: url.href,
      finalUrl: page.finalUrl,
      categories,
      meta: {
        ttfbMs: page.ttfbMs,
        htmlBytes: Buffer.byteLength(page.html),
        totalMs: page.totalMs,
        linksChecked: linkResults.length,
      },
    });

    return NextResponse.json(report);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong while analyzing the site.";
    // Distinguish fetch failures from our bugs: DNS/connection errors get 502.
    const status = /timed out|Could not fetch|returned HTTP|doesn't serve|too big/i.test(message)
      ? 502
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
