"use client";

import { motion } from "framer-motion";

const traction = [
  { label: "Telegram", value: "950+" },
  { label: "WhatsApp", value: "825+" },
  { label: "X", value: "545+" },
  { label: "Daily drops", value: "3–5" },
];

export function TrustedCompanies() {
  return (
    <section className="border-y border-border bg-surface/60 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-2 text-center text-sm uppercase tracking-[0.2em] text-muted">
          Community traction
        </p>
        <p className="mb-6 text-center text-sm text-muted">
          From Telegram drops to Africa&apos;s opportunity engine — Nigeria-first,
          continent-wide.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {traction.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex h-20 flex-col items-center justify-center rounded-md border border-border/80"
            >
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-accent">
                {item.value}
              </span>
              <span className="text-sm text-muted">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
