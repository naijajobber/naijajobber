"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Are the jobs on NaijaJobber verified?",
    a: "Yes. Employer accounts go through verification before jobs are featured publicly.",
  },
  {
    q: "Is NaijaJobber only for Nigerian talent?",
    a: "NaijaJobber is built for African talent broadly — Nigeria-first, continent-wide.",
  },
  {
    q: "Do job seekers pay to apply?",
    a: "Core apply flows are free. Optional Pro tools unlock AI career features.",
  },
  {
    q: "Can employers post remote and hybrid roles?",
    a: "Yes — remote, hybrid, contract, full-time, freelance, and internship roles are supported.",
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
