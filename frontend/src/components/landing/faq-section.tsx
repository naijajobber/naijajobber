"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Are opportunities on NaijaJobber verified?",
    a: "We verify recruiters and moderate listings before they are featured. Verification improves trust — it is not an employment or income guarantee.",
  },
  {
    q: "Is NaijaJobber only for Nigerian talent?",
    a: "Nigeria-first, Africa-wide. We started with Nigeria’s hustle ecosystem and are expanding from Lagos to Nairobi and beyond.",
  },
  {
    q: "What kinds of work can I find?",
    a: "Local gigs, remote roles, and Web3 opportunities — for students, freelancers, community managers, tradespeople, and career switchers.",
  },
  {
    q: "Do hustlers pay to apply?",
    a: "Core discovery and apply flows stay free. Optional Pro tools add learning and career support when you want them.",
  },
  {
    q: "What do employers get?",
    a: "Credible African talent without building a full HR stack — verified recruiters, moderated listings, and faster access to people who hustle.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className="rounded-xl border border-border bg-card">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-border px-5 py-4 text-sm text-muted">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
