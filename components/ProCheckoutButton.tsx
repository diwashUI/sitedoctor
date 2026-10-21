"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { PADDLE_CLIENT_TOKEN, PADDLE_PRICE_ID, SITE_URL } from "@/lib/config";

/**
 * Opens the Paddle overlay checkout for the $29 one-time Pro purchase.
 * On successful payment Paddle redirects to /pro/success, which stamps the
 * Pro flag on this device.
 */
export default function ProCheckoutButton({ className = "" }: { className?: string }) {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  useEffect(() => {
    if (!PADDLE_CLIENT_TOKEN) return;
    initializePaddle({ environment: "production", token: PADDLE_CLIENT_TOKEN }).then(
      (instance) => {
        if (instance) setPaddle(instance);
      },
    );
  }, []);

  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      settings: {
        theme: "light",
        successUrl: `${SITE_URL}/pro/success`,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={openCheckout}
      disabled={!paddle}
      className={`${className} disabled:cursor-wait disabled:opacity-70`}
    >
      Go Pro — $29 one-time
    </button>
  );
}
