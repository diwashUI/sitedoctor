// Central product configuration.

export const SITE_NAME = "SiteDoctor";
export const SITE_URL = "https://sitedoctorapp.vercel.app";

// Paddle checkout (Paddle Billing). Placeholder values — the real Paddle
// products will be created afterwards; do NOT touch the Paddle dashboard.
// Flip CHECKOUT_READY to true once PADDLE_CLIENT_TOKEN / PADDLE_PRICE_ID
// hold the real values.
export const PADDLE_CLIENT_TOKEN = "";
export const PADDLE_PRICE_ID = "pri_01m5fjqrqvzg2ve2qcm1dg12s6";
export const CHECKOUT_READY = true;

// ---------------------------------------------------------------------------
// Display-ad infrastructure (secondary revenue stream).
//
// Ads are OFF by default. To enable later:
//   1. Set ADS_ENABLED = true
//   2. Put your AdSense publisher ID in AD_CLIENT (e.g. "ca-pub-1234567890123456")
//   3. Paste your AdSense <ins> snippet into components/AdSlot.tsx
//
// The AdSlot component renders NOTHING while disabled — no empty boxes,
// no reserved space, no layout shift. Placements: one below the landing hero,
// one below the report. Never popups, never interstitials.
// ---------------------------------------------------------------------------
export const ADS_ENABLED = false;
export const AD_CLIENT = "";
