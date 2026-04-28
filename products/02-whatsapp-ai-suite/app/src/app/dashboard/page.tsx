"use client";

import { useUser } from "@clerk/nextjs";
import {
  MessageCircle,
  CheckCircle,
  Circle,
  BarChart3,
  Clock,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { clsx } from "clsx";

// Placeholder conversations for the UI scaffold.
// These will be replaced by real DB queries once the backend is wired.
const PLACEHOLDER_CONVERSATIONS = [
  {
    id: "c1",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    lastMessage: "Bhai kitna cost hoga AC servicing ka?",
    time: "2 min ago",
    status: "resolved" as const,
  },
  {
    id: "c2",
    name: "Priya Mehta",
    phone: "+91 87654 32109",
    lastMessage: "Order status kya hai mera?",
    time: "8 min ago",
    status: "pending" as const,
  },
  {
    id: "c3",
    name: "Amit Patel",
    phone: "+91 76543 21098",
    lastMessage: "Do you have home delivery?",
    time: "15 min ago",
    status: "resolved" as const,
  },
  {
    id: "c4",
    name: "Sneha Joshi",
    phone: "+91 65432 10987",
    lastMessage: "GST invoice chahiye mujhe",
    time: "32 min ago",
    status: "resolved" as const,
  },
  {
    id: "c5",
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    lastMessage: "What are your working hours?",
    time: "1 hr ago",
    status: "pending" as const,
  },
] as const;

const SETUP_STEPS = [
  { id: 1, label: "Connect WhatsApp number via 360dialog", done: false },
  { id: 2, label: "Upload knowledge base (FAQs, catalogue, pricing)", done: false },
  { id: 3, label: "Test your AI agent in the sandbox", done: false },
  { id: 4, label: "Go live and start handling messages", done: false },
] as const;

// Plan label mapping — kept in sync with lib/pricing.ts
const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  business: "Business",
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  // Clerk publicMetadata is the source of truth for plan until DB is wired.
  const plan = (user?.publicMetadata?.["plan"] as string | undefined) ?? "free";
  const planLabel = PLAN_LABELS[plan] ?? "Free";

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center">
            <MessageCircle size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm">ChatBase</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Plan badge */}
          <span
            className={clsx(
              "text-xs px-2.5 py-1 rounded-full font-medium",
              plan === "business"
                ? "bg-[#25D366]/20 text-[#25D366]"
                : plan === "growth"
                ? "bg-blue-500/15 text-blue-400"
                : "bg-white/5 text-white/40"
            )}
          >
            {planLabel} plan
          </span>
          <span className="text-xs text-white/40">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: MessageCircle,
              label: "Messages handled today",
              value: "—",
              sub: "Connect WhatsApp to start",
            },
            {
              icon: Zap,
              label: "Response rate",
              value: "—",
              sub: "Target: >95%",
            },
            {
              icon: Clock,
              label: "Active hours",
              value: "24/7",
              sub: "AI never sleeps",
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-[#0f0f12] rounded-xl border border-white/5 p-5"
            >
              <Icon size={16} className="text-[#25D366] mb-3" />
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
              <div className="text-[10px] text-white/25 mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* Quick setup checklist */}
        <div className="bg-[#0f0f12] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={14} className="text-[#25D366]" />
            <span className="text-sm font-medium">Quick setup</span>
            <span className="ml-auto text-xs text-white/30">0 / 4 complete</span>
          </div>
          <div className="space-y-3">
            {SETUP_STEPS.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3"
              >
                {step.done ? (
                  <CheckCircle size={16} className="text-[#25D366] shrink-0" />
                ) : (
                  <Circle size={16} className="text-white/20 shrink-0" />
                )}
                <span
                  className={clsx(
                    "text-sm",
                    step.done ? "text-white/40 line-through" : "text-white/70"
                  )}
                >
                  {step.label}
                </span>
                {!step.done && step.id === 1 && (
                  <button className="ml-auto text-xs text-[#25D366] hover:text-[#1fb855] flex items-center gap-1 transition-colors">
                    Connect <ArrowUpRight size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent conversations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Recent conversations
            </h2>
            <span className="text-xs text-white/25">Placeholder data</span>
          </div>
          <div className="bg-[#0f0f12] rounded-xl border border-white/5 divide-y divide-white/5">
            {PLACEHOLDER_CONVERSATIONS.map((convo) => (
              <div
                key={convo.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                {/* Avatar initial */}
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-[#25D366]">
                    {convo.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{convo.name}</span>
                    <span className="text-xs text-white/25">{convo.phone}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate mt-0.5">
                    {convo.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-white/25">{convo.time}</span>
                  <span
                    className={clsx(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      convo.status === "resolved"
                        ? "bg-[#25D366]/10 text-[#25D366]"
                        : "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    {convo.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA — only shown on free plan */}
        {plan === "free" && (
          <div className="bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 rounded-xl border border-[#25D366]/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#25D366] font-medium uppercase tracking-widest mb-1">
                Upgrade
              </div>
              <h3 className="font-semibold mb-1">Start handling real messages</h3>
              <p className="text-sm text-white/40">
                Starter plan — ₹999/mo · 500 messages · 1 WhatsApp number
              </p>
            </div>
            <a
              href="/api/billing"
              className="shrink-0 px-5 py-2.5 bg-[#25D366] hover:bg-[#1fb855] rounded-xl text-sm font-medium transition-colors text-white"
            >
              Upgrade now
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
