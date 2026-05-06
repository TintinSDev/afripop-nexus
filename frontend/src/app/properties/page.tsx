"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch(
        "https://nexusbackend-six.vercel.app/api/properties",
      );
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (propId: number, price: number) => {
    const phone = prompt("Enter your M-Pesa Number (e.g. +2547...)");
    if (!phone) return;

    try {
      const res = await fetch(
        "https://nexusbackend-six.vercel.app/api/buy-fraction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: propId,
            amount: price,
            phoneNumber: phone,
          }),
        },
      );
      const data = await res.json();
      alert(data.message || "Investment successful!");
      fetchProperties(); // Refresh list
    } catch (err) {
      alert("Payment failed to initialize");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-10 px-4 pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white mb-2">
          Available Investment Opportunities
        </h1>
        <p className="text-slate-400">
          Browse AI-valuated properties and invest in fractional shares
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center border border-blue-500/20">
          <p className="text-slate-400 mb-4">No properties listed yet</p>
          <Link
            href="/invest"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all"
          >
            List Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-1">{prop.title}</h3>
                  <p className="text-slate-400 text-sm">{prop.location}</p>
                </div>
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                  {prop.growthPotential}/10
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {prop.description}
              </p>

              {/* Stats */}
              <div className="border-t border-white/5 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Valuation</span>
                  <span className="font-bold text-emerald-400">
                    KES {(prop.totalValuation / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Price per 1%</span>
                  <span className="font-bold">
                    KES {prop.pricePerFraction?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Investors</span>
                  <span className="font-bold text-blue-400">
                    {prop._count?.shares || 0}
                  </span>
                </div>
              </div>

              {/* Invest Button */}
              <button
                onClick={() => handleBuy(prop.id, prop.pricePerFraction)}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
              >
                Invest Now
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
