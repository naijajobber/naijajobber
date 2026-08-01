"use client";

import { motion } from "framer-motion";

const companies = [
  "Andela",
  "Flutterwave",
  "Paystack",
  "Interswitch",
  "Remote Labs",
  "NovaHire",
];

export function TrustedCompanies() {
  return (
    <section className="border-y border-border bg-surface/60 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 text-center text-sm uppercase tracking-[0.2em] text-muted">
          Trusted by ambitious teams
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {companies.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex h-14 items-center justify-center rounded-md border border-border/80 text-sm font-medium text-muted"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
