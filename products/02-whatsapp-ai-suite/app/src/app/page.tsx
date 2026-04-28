import Link from "next/link";
import { ArrowRight, MessageCircle, Zap, BarChart3, Bot } from "lucide-react";

const STATS = [
  { value: "200+", label: "msgs/day handled" },
  { value: "< 2s", label: "response time" },
  { value: "3", label: "languages supported" },
  { value: "No code", label: "required" },
];

const FEATURES = [
  {
    icon: Bot,
    title: "AI Agent Builder",
    desc: "Upload your product catalogue, FAQs, and pricing. ChatBase builds a custom AI agent that knows your business inside out.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    desc: "Connect your WhatsApp Business number in minutes via 360dialog. No code, no webhooks to manage — we handle it.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track messages handled, response rates, busiest hours, and customer satisfaction. Know exactly how your AI is performing.",
  },
];

const PRICING = [
  {
    id: "starter",
    name: "Starter",
    priceINR: 999,
    messages: 500,
    tag: "Try it out",
    features: ["500 msgs/mo", "1 WhatsApp number", "Basic analytics", "Email support"],
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    priceINR: 2999,
    messages: 5000,
    tag: "Most popular",
    features: ["5,000 msgs/mo", "2 WhatsApp numbers", "Full analytics", "Hindi + Hinglish + English", "Priority support"],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    priceINR: 5999,
    messages: -1,
    tag: "Scale without limits",
    features: ["Unlimited messages", "5 WhatsApp numbers", "Advanced analytics", "Custom AI training", "Dedicated support"],
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white">

      {/* Sticky nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-md bg-[#07070a]/80 z-50">
        <div className="flex items-center gap-2.5">
          {/* Green dot logo mark */}
          <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center">
            <MessageCircle size={13} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">ChatBase</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-[#25D366] hover:bg-[#1fb855] rounded-lg text-sm font-medium transition-colors text-white"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          Built for Indian SMBs · Responds in Hindi, Hinglish &amp; English
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Your WhatsApp.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            }}
          >
            Now AI-powered.
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
          Indian SMBs handle 200+ WhatsApp messages/day manually. ChatBase handles
          them automatically — in Hindi, Hinglish, or English.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1fb855] rounded-xl font-medium transition-colors text-white"
          >
            Get started free <ArrowRight size={15} />
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors text-sm"
          >
            <Zap size={15} /> See a demo
          </Link>
        </div>

        {/* Stat blocks */}
        <div className="border-y border-white/5 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-[#25D366]">{value}</div>
                <div className="text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs text-[#25D366] font-medium uppercase tracking-widest mb-3 text-center">
          Features
        </p>
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to automate WhatsApp
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#0f0f12] rounded-xl border border-white/5 p-6"
            >
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#25D366]" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-xs text-[#25D366] font-medium uppercase tracking-widest mb-3 text-center">
          Pricing
        </p>
        <h2 className="text-3xl font-bold text-center mb-3">
          Simple, transparent pricing
        </h2>
        <p className="text-white/40 text-center text-sm mb-12">
          All plans include a 14-day free trial. No credit card required.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {PRICING.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#0f0f12] rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-[#25D366]/40"
                  : "border-white/5"
              }`}
            >
              {plan.highlight && (
                <div className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-[#25D366]/15 text-[#25D366] w-fit mb-4">
                  {plan.tag}
                </div>
              )}
              {!plan.highlight && (
                <div className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-white/5 text-white/40 w-fit mb-4">
                  {plan.tag}
                </div>
              )}

              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <div className="mb-5">
                <span className="text-3xl font-bold">
                  ₹{plan.priceINR.toLocaleString("en-IN")}
                </span>
                <span className="text-white/40 text-sm">/mo</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="text-[#25D366] text-base leading-none">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-[#25D366] hover:bg-[#1fb855] text-white"
                    : "border border-white/10 hover:bg-white/5 text-white/70"
                }`}
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        © 2026 AddonWeb Solutions · Ahmedabad, Gujarat, India ·{" "}
        <a
          href="mailto:support@addonweb.io"
          className="hover:text-white/50 transition-colors"
        >
          support@addonweb.io
        </a>
      </footer>
    </main>
  );
}
