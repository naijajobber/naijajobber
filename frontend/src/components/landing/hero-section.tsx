"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.18),_transparent_55%),linear-gradient(160deg,#0a0a0a_0%,#0f1612_45%,#0a0a0a_100%)] dark:opacity-100 opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><path d=%22M0 40L40 0%22 stroke=%22%2322c55e%22 stroke-opacity=%220.05%22/></svg>')]" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="NaijaJobber logo"
              width={64}
              height={64}
              className="rounded-lg shadow-[0_0_40px_rgba(34,197,94,0.35)]"
              priority
            />
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
              NaijaJobber
            </p>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
            Remote careers for Africa&apos;s brightest talent.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
            Discover verified remote roles worldwide and get matched with
            employers who hire African professionals.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-[#22c55e] text-[#04140b]">
                Start as talent <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/register?role=employer">
              <Button
                size="lg"
                variant="secondary"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Hire talent
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          action="/jobs"
          className="mt-14 flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-white/10 bg-black/35 p-3 backdrop-blur-md sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <Input
              name="q"
              placeholder="Search remote roles, skills, or companies"
              className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/40"
            />
          </div>
          <Button type="submit" className="bg-[#22c55e] text-[#04140b] sm:w-auto">
            Search jobs
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
