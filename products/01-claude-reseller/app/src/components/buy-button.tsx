"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, ShoppingCart, CheckCircle } from "lucide-react";

interface BuyButtonProps {
  packId: string;
  packLabel: string;
  priceDisplay: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyButton({ packId, packLabel, priceDisplay }: BuyButtonProps) {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const purchasedPacks = (user?.publicMetadata?.["purchasedPacks"] as string[] | undefined) ?? [];
  const alreadyOwned = purchasedPacks.includes(packId);

  async function handleBuy() {
    if (!isSignedIn) { window.location.href = "/sign-in"; return; }
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) { alert("Failed to load payment gateway. Check your internet connection."); setLoading(false); return; }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    const order = await res.json() as { orderId: string; amount: number; currency: string; keyId: string; packLabel: string };

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "AddonWeb Claude Toolkit",
      description: order.packLabel,
      order_id: order.orderId,
      prefill: {
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? "",
      },
      theme: { color: "#8b5cf6" },
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        // Verify payment and grant access
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, packId }),
        });
        if (verifyRes.ok) {
          setSuccess(true);
          setTimeout(() => window.location.href = "/dashboard", 1500);
        } else {
          alert("Payment verification failed. Contact support@addonweb.io");
        }
        setLoading(false);
      },
      modal: { ondismiss: () => setLoading(false) },
    };

    new window.Razorpay(options).open();
  }

  if (alreadyOwned || success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium">
        <CheckCircle size={14} />
        {success ? "Unlocked! Redirecting…" : "Owned"}
      </div>
    );
  }

  return (
    <button
      onClick={() => void handleBuy()}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
      {loading ? "Processing…" : `Buy · ${priceDisplay}`}
    </button>
  );
}
