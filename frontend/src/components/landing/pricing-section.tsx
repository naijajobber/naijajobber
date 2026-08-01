import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For individual job seekers getting started.",
    features: ["Profile & CV upload", "Job alerts", "Apply to 20 roles / mo"],
    cta: "Create account",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro Talent",
    price: "$12/mo",
    description: "AI tools for serious career moves.",
    features: [
      "AI resume review",
      "Cover letter generator",
      "Priority matching",
    ],
    cta: "Go Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Employer",
    price: "$99/mo",
    description: "Hire verified African talent at scale.",
    features: [
      "Job posting + featured boost",
      "Applicant pipeline",
      "Team seats",
    ],
    cta: "Start hiring",
    href: "/register?role=employer",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-surface/50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Pricing
        </h2>
        <p className="mt-2 text-muted">Simple plans. Cancel anytime.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${
                plan.highlight
                  ? "border-accent bg-card shadow-[0_0_0_1px_rgba(34,197,94,0.25)]"
                  : "border-border bg-card"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-3xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="text-foreground/90">
                    · {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="mt-6 block">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
