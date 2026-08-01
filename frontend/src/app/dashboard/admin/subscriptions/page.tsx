"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminCoupon,
  listAdminCoupons,
  listAdminPlans,
  upsertAdminPlan,
  type AdminPlan,
} from "@/lib/admin-api";

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const plansQ = useQuery({
    queryKey: ["admin-plans"],
    queryFn: listAdminPlans,
  });
  const couponsQ = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: listAdminCoupons,
  });

  const plans = plansQ.data?.data ?? [];
  const coupons = couponsQ.data?.data ?? [];

  const [planForm, setPlanForm] = useState<AdminPlan>({
    code: "",
    name: "",
    price: 0,
    currency: "USD",
    features: [],
  });
  const [couponCode, setCouponCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Subscriptions
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage plans and coupons (mock billing).
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Plans</h2>
        <div className="mt-3 space-y-2">
          {plans.map((p) => (
            <div
              key={p.code}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-medium">
                {p.name} ({p.code})
              </p>
              <p className="text-xs text-muted">
                {p.currency || "USD"} {p.price}/{p.interval || "month"} ·{" "}
                {(p.features || []).join(", ") || "no features"}
              </p>
            </div>
          ))}
        </div>
        <form
          className="mt-4 grid gap-2 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await upsertAdminPlan(planForm);
            void qc.invalidateQueries({ queryKey: ["admin-plans"] });
          }}
        >
          <Input
            placeholder="Code"
            value={planForm.code}
            onChange={(e) =>
              setPlanForm((f) => ({ ...f, code: e.target.value }))
            }
            required
          />
          <Input
            placeholder="Name"
            value={planForm.name}
            onChange={(e) =>
              setPlanForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <Input
            type="number"
            placeholder="Price"
            value={planForm.price}
            onChange={(e) =>
              setPlanForm((f) => ({
                ...f,
                price: Number(e.target.value) || 0,
              }))
            }
          />
          <Input
            placeholder="Features (comma-separated)"
            onChange={(e) =>
              setPlanForm((f) => ({
                ...f,
                features: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
          <Button type="submit" className="sm:col-span-2">
            Save plan
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Coupons</h2>
        <div className="mt-3 space-y-2">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-medium">{c.code}</p>
              <p className="text-xs text-muted">
                {c.percentOff != null ? `${c.percentOff}% off` : ""}
                {c.amountOff != null ? ` ${c.amountOff} off` : ""} · used{" "}
                {c.redemptionCount ?? 0}/{c.maxRedemptions ?? "∞"}
              </p>
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await createAdminCoupon({
              code: couponCode,
              percentOff: Number(percentOff) || undefined,
            });
            setCouponCode("");
            void qc.invalidateQueries({ queryKey: ["admin-coupons"] });
          }}
        >
          <Input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            required
          />
          <Input
            className="w-28"
            placeholder="% off"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
          />
          <Button type="submit">Create coupon</Button>
        </form>
      </section>
    </div>
  );
}
