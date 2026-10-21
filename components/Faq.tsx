export interface FaqItem {
  q: string;
  a: string;
}

/** FAQ section with JSON-LD FAQPage schema for SEO. */
export default function Faq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section className="mx-auto mt-16 max-w-3xl" aria-label="Frequently asked questions">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {items.map((item, i) => (
          <details key={i} className="group px-6 py-4">
            <summary className="cursor-pointer list-none text-[15px] font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span className="text-slate-400 transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
