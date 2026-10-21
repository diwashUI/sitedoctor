import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SiteDoctor — Website Health Auditor | Speed, SEO, Accessibility",
    template: "%s | SiteDoctor",
  },
  description:
    "Paste any website URL and get a full health report: speed, SEO, accessibility, broken links and security headers — each issue explained in plain words with how to fix it.",
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  other: {
    "color-scheme": "light",
  },
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SiteDoctor home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">SiteDoctor</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white text-slate-900 antialiased">
        <header className="border-b border-slate-100">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Logo />
            <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link href="/pricing" className="rounded-lg px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Pricing
              </Link>
              <Link href="/#sample" className="rounded-lg px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Sample report
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-slate-500">
                Website health audits in plain words. Paste a URL, get a report card for your site.
              </p>
            </div>
            <nav aria-label="Product">
              <p className="text-sm font-semibold text-slate-900">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link href="/pricing" className="inline-flex min-h-[44px] items-center hover:text-slate-900">Pricing</Link></li>
                <li><Link href="/#how" className="inline-flex min-h-[44px] items-center hover:text-slate-900">How it works</Link></li>
              </ul>
            </nav>
            <nav aria-label="Legal">
              <p className="text-sm font-semibold text-slate-900">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link href="/terms" className="inline-flex min-h-[44px] items-center hover:text-slate-900">Terms of Service</Link></li>
                <li><Link href="/privacy" className="inline-flex min-h-[44px] items-center hover:text-slate-900">Privacy Policy</Link></li>
                <li><Link href="/refund" className="inline-flex min-h-[44px] items-center hover:text-slate-900">Refund Policy</Link></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
            © {YEAR} SiteDoctor. Built by{" "}
            <a href="https://sahayakos.vercel.app" className="underline hover:text-slate-600">
              SahayakOS
            </a>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
