import { motion } from "framer-motion";

export const AICard = ({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
          AI Live
        </span>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p
        className={`text-sm ${trend.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}
      >
        {trend} from last month
      </p>
    </motion.div>
  );
};
