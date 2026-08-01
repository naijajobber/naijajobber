"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getWallet,
  listWalletTransactions,
  withdrawWallet,
} from "@/lib/billing-api";

export default function WalletPage() {
  const qc = useQueryClient();
  const walletQ = useQuery({ queryKey: ["wallet"], queryFn: getWallet });
  const txQ = useQuery({
    queryKey: ["wallet-tx"],
    queryFn: listWalletTransactions,
  });
  const [amount, setAmount] = useState("10");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wallet = walletQ.data?.data;
  const txs =
    (txQ.data?.data as Array<{
      _id: string;
      amount?: number;
      type?: string;
      status?: string;
      createdAt?: string;
    }> | undefined) || [];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Wallet
        </h1>
        <p className="mt-1 text-sm text-muted">
          Balance, mock withdrawals, and referral credits. Payments stay in mock mode.
        </p>
      </div>
      {message && <p className="text-sm text-accent">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Available</p>
          <p className="mt-1 text-2xl font-semibold">
            {wallet?.currency || "USD"} {wallet?.balance ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Pending</p>
          <p className="mt-1 text-2xl font-semibold">
            {wallet?.currency || "USD"} {wallet?.pendingBalance ?? 0}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          type="number"
          className="max-w-[8rem]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          onClick={async () => {
            setError(null);
            setMessage(null);
            try {
              await withdrawWallet(Number(amount));
              await qc.invalidateQueries({ queryKey: ["wallet"] });
              await qc.invalidateQueries({ queryKey: ["wallet-tx"] });
              setMessage("Mock withdrawal completed");
            } catch (err) {
              setError(
                (err as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message || "Withdraw failed",
              );
            }
          }}
        >
          Withdraw (mock)
        </Button>
      </div>

      <p className="text-xs text-muted">
        Payment methods: Paystack / Flutterwave / Stripe scaffolds — live payouts
        disabled in mock mode.
      </p>

      <section>
        <h2 className="text-lg font-semibold">Transactions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {txs.map((t) => (
            <li
              key={t._id}
              className="flex justify-between rounded-lg border border-border px-3 py-2"
            >
              <span>
                {t.type || "tx"} · {t.status}
              </span>
              <span>{t.amount}</span>
            </li>
          ))}
          {!txs.length && (
            <li className="text-muted">No wallet transactions yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
