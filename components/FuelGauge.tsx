"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RIR, getRIRColor, getRIRLabel } from "@/lib/apex-data";
import { AlertTriangle } from "lucide-react";

interface FuelGaugeProps {
  value: RIR;
  onChange: (value: RIR) => void;
  showFeedback?: boolean;
}

export default function FuelGauge({ value, onChange, showFeedback = true }: FuelGaugeProps) {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (value >= 4 && showFeedback) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [value, showFeedback]);

  const getGradientColor = (rir: RIR): string => {
    if (rir === 0) return "from-red-600 to-red-500";
    if (rir <= 2) return "from-yellow-500 to-yellow-400";
    return "from-green-500 to-green-400";
  };

  const getPosition = (rir: RIR): number => {
    // Map RIR 0-5 to 0-100%
    return (rir / 5) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Fuel Gauge Visual */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
        
        {/* Indicator */}
        <div
          className="absolute top-0 h-3 rounded-full transition-all duration-300"
          style={{
            width: `${getPosition(value)}%`,
            background: `linear-gradient(to right, ${
              value === 0
                ? "#dc2626"
                : value <= 2
                ? "#eab308"
                : "#22c55e"
            }, ${
              value === 0
                ? "#ef4444"
                : value <= 2
                ? "#facc15"
                : "#4ade80"
            })`,
          }}
        />
        
        {/* Slider */}
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as RIR)}
          className="absolute top-0 w-full h-3 opacity-0 cursor-pointer z-10"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-400">
        <div className="text-left">
          <div className="font-semibold text-red-500">0 RIR</div>
          <div className="text-[10px]">Empty Tank</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-yellow-500">1-2 RIR</div>
          <div className="text-[10px]">Sweet Spot</div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-green-500">3+ RIR</div>
          <div className="text-[10px]">Too Easy</div>
        </div>
      </div>

      {/* Current Value Display */}
      <div className="text-center">
        <div className="text-sm text-slate-400 mb-1">Reps In Reserve</div>
        <div className="text-2xl font-mono font-bold text-blue-500">{value}</div>
        <div className="text-sm text-slate-300 mt-1">{getRIRLabel(value)}</div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && value >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-500 mb-1">
                Intensity too low for hypertrophy goals
              </div>
              <div className="text-sm text-slate-300">
                Increase weight to reach optimal stimulus (1-2 RIR)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

