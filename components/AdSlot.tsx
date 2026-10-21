import { ADS_ENABLED, AD_CLIENT } from "@/lib/config";

/**
 * Reusable display-ad slot (secondary revenue stream — e.g. AdSense).
 *
 * Renders NOTHING while ads are disabled: no empty box, no reserved space,
 * no layout shift. When enabled, renders a labeled container at standard
 * responsive-leaderboard size (728x90 desktop / 320x100 mobile).
 *
 * Placement rule: below the hero on the landing page, and below the tool
 * workspace on tool pages. NEVER inside the file-processing flow, never as
 * popups or interstitials — the privacy/trust UX comes first.
 */
export default function AdSlot({ slot }: { slot: string }) {
  if (!ADS_ENABLED) return null;

  return (
    <div className="mx-auto my-10 flex justify-center px-4" data-ad-slot={slot}>
      <div
        role="complementary"
        aria-label="Advertisement"
        className="flex h-[100px] w-[320px] flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 md:h-[90px] md:w-[728px]"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Advertisement
        </span>
        {/*
          Paste your AdSense <ins class="adsbygoogle"> snippet here, e.g.:
          <ins className="adsbygoogle"
               style={{ display: "block" }}
               data-ad-client={AD_CLIENT}
               data-ad-slot={slot}
               data-ad-format="horizontal"
               data-full-width-responsive="true" />
        */}
        <span className="hidden">{AD_CLIENT}</span>
      </div>
    </div>
  );
}
