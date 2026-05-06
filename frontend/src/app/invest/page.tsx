"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function InvestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    squareFootage: 1000,
  });

  const triggerAI = async () => {
    if (!formData.title || !formData.description)
      return alert("Please fill in the details");

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://nexusbackend-six.vercel.app/api/valuate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Valuation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 pb-20">
      {/* View Properties CTA */}
      <div className="mb-6 glass p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Looking to invest?</h3>
          <p className="text-slate-400 text-sm">Browse available properties</p>
        </div>
        <Link
          href="/properties"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all font-bold"
        >
          View Properties
        </Link>
      </div>

      {/* Property Listing Form */}
      <div className="glass p-8 rounded-3xl shadow-2xl border border-blue-500/20">
        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
          List New Property (AI Scan)
        </h2>

        <div className="space-y-4">
          <input
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
            placeholder="Property Title (e.g., Kilimani Heights)"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
            placeholder="Location (e.g. Westlands, Nairobi)"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <textarea
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
            placeholder="Describe the amenities, age of building, and unique features..."
            rows={4}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <button
            onClick={triggerAI}
            disabled={loading}
            className={`w-full p-4 rounded-xl font-bold transition-all ${
              loading
                ? "bg-slate-800 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is Valuating...
              </span>
            ) : (
              "Generate AI Valuation"
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass p-8 rounded-3xl border border-emerald-500/30"
          >
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              AI Analysis Complete
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-500 text-xs uppercase">
                  Est. Market Value
                </p>
                <p className="text-2xl font-bold">
                  KES {(result?.totalValuation ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Price Per 1%</p>
                <p className="text-2xl font-bold">
                  KES {(result?.pricePerFraction ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Growth Score</p>
                <p className="text-2xl font-bold text-blue-400">
                  {result.growthPotential}/10
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm">
                Property listed successfully! View it in the{" "}
                <Link href="/properties" className="underline font-bold">
                  Properties marketplace
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
