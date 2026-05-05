import Link from "next/link";
import { Nav } from "@/components/nav";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for SKILON by AddonWeb Solutions.",
};

const EFFECTIVE_DATE = "1 May 2026";

export default function TermsPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Nav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div
          className="prose-sm space-y-8"
          style={{ color: "var(--text-secondary)", lineHeight: "1.75" }}
        >
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using SKILON (&quot;Service&quot;) operated by AddonWeb Solutions
              (&quot;Company,&quot; &quot;we,&quot; &quot;us&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              SKILON is a digital marketplace of AI skill modules (&quot;Skills&quot;) designed to
              run with Anthropic&apos;s Claude API, Claude Code, and compatible MCP servers. Skills
              are delivered as TypeScript/JavaScript packages with associated documentation.
            </p>
            <p>
              All Skills are free to install and run during our launch period. We reserve the right
              to introduce paid plans for advanced features in the future; if and when that happens,
              users will be notified at least 30 days in advance and existing free access will not
              be retroactively revoked.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              You must create an account via our authentication provider (Clerk) to install or run
              Skills. You agree to provide accurate, current, and complete information and to
              update it as necessary. You are responsible for maintaining the security of your
              credentials. You must notify us immediately of any unauthorized use at{" "}
              <a href="mailto:support@addonweb.io" className="text-violet-400 hover:underline">
                support@addonweb.io
              </a>
              .
            </p>
          </Section>

          <Section title="4. Pricing and Payments">
            <p>
              The Service is currently free for all users. No payment information is collected.
              If we introduce paid plans in the future, pricing, payment processors, and refund
              terms will be disclosed prominently in advance and a separate addendum to these Terms
              will apply to those plans.
            </p>
          </Section>

          <Section title="5. License and Intellectual Property">
            <p>
              Upon purchase, we grant you a personal, non-exclusive, non-transferable, revocable
              license to use the purchased Skills for your own projects, including commercial
              projects. You may NOT: resell, sublicense, distribute, or publicly republish Skill
              content; create competing products derived from Skill content; or share your account
              credentials with third parties.
            </p>
            <p>
              All Skill content, documentation, branding, and underlying code remain the intellectual
              property of AddonWeb Solutions. Use of the Anthropic Claude API is governed separately
              by Anthropic&apos;s own terms of service.
            </p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violate any applicable law or regulation</li>
              <li>Infringe the intellectual property rights of any party</li>
              <li>Transmit spam, malware, or malicious code</li>
              <li>Scrape, crawl, or systematically copy Service content without permission</li>
              <li>Attempt to reverse-engineer or extract the underlying LLM prompts</li>
              <li>Use the Service to generate content that is harmful, abusive, or illegal</li>
            </ul>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind,
              whether express or implied. We do not warrant that the Service will be uninterrupted,
              error-free, or produce any particular output. AI-generated outputs may contain
              inaccuracies; always review before use in production systems.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, AddonWeb Solutions shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including loss of
              profits, data, or business opportunities, arising from your use of the Service. Our
              total liability for any claim shall not exceed the amount you paid to us in the
              3 months preceding the claim.
            </p>
          </Section>

          <Section title="9. Modifications to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes by updating the effective date and, where appropriate, by email.
              Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </Section>

          <Section title="10. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of the courts in Ahmedabad, Gujarat. For consumer disputes,
              you may also contact the relevant consumer forum under the Consumer Protection Act, 2019.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For questions about these Terms, contact us at:{" "}
              <a href="mailto:support@addonweb.io" className="text-violet-400 hover:underline">
                support@addonweb.io
              </a>
              <br />
              AddonWeb Solutions, Ahmedabad, Gujarat, India.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t text-xs flex items-center gap-4" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
          <Link href="/legal/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
          <Link href="/" className="hover:text-violet-400">Home</Link>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-base font-semibold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
