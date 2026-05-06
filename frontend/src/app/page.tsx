"use client";
import { useEffect, useState } from "react";
import { AICard } from "@/components/ui/AICard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({
    totalValuation: 0,
    investorCount: 0,
    avgYield: "0%",
  });

  useEffect(() => {
    fetch("https://nexusbackend-khaki.vercel.app/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats fetch failed", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto pt-20 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-slate-200">
          AfriProp Nexus
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AICard
          title="Market Valuation"
          value={`KES ${(stats.totalValuation / 1000000).toFixed(1)}M`}
          trend="+12.4%"
        />
        <AICard
          title="Total Investors"
          value={stats.investorCount.toString()}
          trend="+5.1%"
        />
        <AICard
          title="Avg. Rental Yield"
          value={stats.avgYield}
          trend="+0.2%"
        />
      </div>
      <div className="mt-12 flex justify-center">
        <Link
          href="/invest"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          Explore Properties
        </Link>
      </div>
    </div>
  );
}
