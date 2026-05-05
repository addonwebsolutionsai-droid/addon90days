import Link from "next/link";
import { Nav } from "@/components/nav";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Claude Toolkit by AddonWeb Solutions.",
};

const EFFECTIVE_DATE = "1 May 2026";

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Nav />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-xs text-violet-400 font-medium uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div
          className="space-y-8"
          style={{ color: "var(--text-secondary)", lineHeight: "1.75", fontSize: "0.875rem" }}
        >
          <Section title="1. Introduction">
            <p>
              AddonWeb Solutions (&quot;Company,&quot; &quot;we,&quot; &quot;us&quot;) operates the Claude Toolkit
              marketplace at claudetoolkit.addonweb.io. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your personal information when you use our Service.
            </p>
            <p>
              This policy complies with the Information Technology Act, 2000 (India), the IT
              (Amendment) Act, 2008, and, where applicable, the General Data Protection Regulation
              (GDPR) for users in the European Economic Area.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong style={{ color: "var(--text-primary)" }}>Information you provide:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account data: name, email address, password (hashed, managed by Clerk)</li>
              <li>Support communications: emails you send us</li>
            </ul>
            <p className="mt-3"><strong style={{ color: "var(--text-primary)" }}>Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Usage data: pages visited, skills viewed, filter interactions (via PostHog)</li>
              <li>Device data: IP address, browser type, operating system</li>
              <li>Performance data: errors and exceptions (via Sentry)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, operate, and improve the Service</li>
              <li>To authenticate your account and protect against fraud</li>
              <li>To send transactional emails (account verification, password resets)</li>
              <li>To send product updates if you have opted in</li>
              <li>To comply with legal obligations</li>
              <li>To analyse usage patterns and improve the product (anonymised)</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing (GDPR)">
            <p>For EEA users, we process your data on these legal bases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--text-primary)" }}>Contract:</strong> to provide the Service to you</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Legitimate interests:</strong> fraud prevention, security, product improvement</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Consent:</strong> marketing emails (you may withdraw at any time)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Legal obligation:</strong> tax records, compliance</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Disclosure">
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: "var(--text-primary)" }}>Clerk</strong> — authentication and user management</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Supabase</strong> — database hosting (data stored in applicable region)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>PostHog</strong> — product analytics (anonymised where possible)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Sentry</strong> — error monitoring</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Vercel</strong> — hosting and CDN</li>
            </ul>
            <p>
              All third-party processors are contractually bound to process your data only as
              instructed by us and to maintain appropriate security measures.
            </p>
            <p>
              We may disclose your data if required by law, court order, or governmental authority.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active plus 3 years for
              tax and legal compliance. Purchase records are retained for 7 years as required by
              Indian tax law. You may request deletion of your account at any time (subject to
              legal retention requirements).
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li>Object to processing based on legitimate interests</li>
              <li>Data portability (receive your data in a machine-readable format)</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
            <p>
              To exercise these rights, email{" "}
              <a href="mailto:support@addonweb.io" className="text-violet-400 hover:underline">
                support@addonweb.io
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Cookies and Tracking">
            <p>
              We use essential cookies for authentication (Clerk session cookies) and functional
              cookies for theme preference. We use PostHog for analytics with anonymised IPs.
              You can disable non-essential tracking via your browser settings. We do not use
              third-party advertising cookies.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We implement technical and organisational measures to protect your data, including
              TLS encryption in transit, encrypted database storage, role-based access controls,
              and regular security reviews. No system is 100% secure; in the event of a breach
              we will notify affected users as required by applicable law.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The Service is not directed to children under 13 (or under 16 in the EEA). We do
              not knowingly collect personal data from children. If you believe we have
              inadvertently collected such data, contact us immediately.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via email or a prominent notice on the Service. Continued use after
              the effective date constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact and Grievance Officer">
            <p>
              For privacy-related enquiries or to raise a grievance (as required under the IT
              Act, 2000):
              <br />
              <a href="mailto:support@addonweb.io" className="text-violet-400 hover:underline">
                support@addonweb.io
              </a>
              <br />
              AddonWeb Solutions, Ahmedabad, Gujarat, India
              <br />
              We aim to resolve all queries within 30 days.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t text-xs flex items-center gap-4" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
          <Link href="/legal/terms" className="text-violet-400 hover:underline">Terms of Service</Link>
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
