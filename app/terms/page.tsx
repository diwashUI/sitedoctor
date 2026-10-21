import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SiteDoctor",
  description: "SiteDoctor's terms of service for free scans and the Pro purchase.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: October 21, 2026</p>

      <Section title="The service">
        <p>
          SiteDoctor analyzes publicly accessible web pages and reports on their
          health — speed, SEO, accessibility, links and security. By using the site
          or purchasing Pro, you agree to these terms.
        </p>
      </Section>

      <Section title="Acceptable use">
        <ul className="list-disc space-y-2 pl-5">
          <li>Only scan websites you own or have permission to analyze.</li>
          <li>Don&apos;t abuse the scanner — for example, hammering the same site with repeated scans.</li>
        </ul>
      </Section>

      <Section title="Pro license">
        <ul className="list-disc space-y-2 pl-5">
          <li>Pro is a one-time payment of $29 USD — not a subscription.</li>
          <li>
            Pro activates on the browser you completed checkout from. There are no
            accounts, so moving to a new browser requires your purchase receipt.
          </li>
          <li>Reports are guidance, not guarantees — always verify important changes with your own testing.</li>
        </ul>
      </Section>

      <Section title="Availability">
        <p>
          The service is provided as-is. We aim to keep it reliable but don&apos;t
          guarantee uninterrupted availability. Scan results depend on the target
          site responding to our requests.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          To the maximum extent permitted by law, SiteDoctor is not liable for any
          indirect or consequential damages arising from use of the site or its
          reports. Our total liability for paid Pro is limited to the amount you
          paid ($29 USD).
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms as the product evolves. Continued use of the
          site after changes means you accept the updated terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:itsaurevya@gmail.com" className="text-blue-600 underline hover:text-blue-700">
            itsaurevya@gmail.com
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
