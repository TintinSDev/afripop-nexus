"use client";
import { motion } from "framer-motion";

export const BackgroundBeam = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {/* Primary Navy Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-900/30 blur-[120px]"
      />
      {/* Moving Gray Light */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, -100, 0],
          y: [0, 200, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-slate-500/10 blur-[150px]"
      />
    </div>
  );
};
