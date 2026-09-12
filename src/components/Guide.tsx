import { useState } from "react";
import type { ReactNode } from "react";

interface GuideSection {
  title: string;
  content: ReactNode;
}

interface GuideProps {
  title: string;
  sections: GuideSection[];
}

/** Guide d'utilisation en accordéon, replié par défaut. Contenu injecté par props. */
export default function Guide({ title, sections }: GuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-black text-slate-900">{title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="space-y-5 border-t border-slate-200 px-5 py-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-slate-800">{section.title}</h3>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
