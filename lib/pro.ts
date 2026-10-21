// Pro license state — 100% client-side by design.
//
// After a successful Paddle checkout the buyer lands on /pro/success, which
// stamps this flag. Pro features (PDF report export) unlock on this device.
export const PRO_STORAGE_KEY = "sitedoctor_pro";

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PRO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPro(): void {
  try {
    window.localStorage.setItem(PRO_STORAGE_KEY, "1");
  } catch {
    // Storage unavailable — the Paddle receipt email is the proof of purchase.
  }
}
