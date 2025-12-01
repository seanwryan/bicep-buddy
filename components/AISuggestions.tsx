"use client";

import { AISuggestion } from "@/lib/workout-storage";
import { TrendingUp, Plus, Minus, RefreshCw, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApply: (id: string) => void;
  onDismiss?: (id: string) => void;
  title?: string;
}

export default function AISuggestions({
  suggestions,
  onApply,
  onDismiss,
  title = "AI Suggestions",
}: AISuggestionsProps) {
  const activeSuggestions = suggestions.filter((s) => !s.applied);

  if (activeSuggestions.length === 0) {
    return null;
  }

  const getIcon = (type: AISuggestion["type"], change?: string) => {
    switch (type) {
      case "weight":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "volume":
        return change?.includes("+") ? (
          <Plus className="w-5 h-5 text-green-500" />
        ) : (
          <Minus className="w-5 h-5 text-yellow-500" />
        );
      case "swap":
        return <RefreshCw className="w-5 h-5 text-purple-500" />;
    }
  };

  const getTypeLabel = (type: AISuggestion["type"]) => {
    switch (type) {
      case "weight":
        return "Weight Progression";
      case "volume":
        return "Volume Adjustment";
      case "swap":
        return "Exercise Swap";
    }
  };

  const getTypeColor = (type: AISuggestion["type"]) => {
    switch (type) {
      case "weight":
        return "border-blue-500/50 bg-blue-500/10";
      case "volume":
        return "border-green-500/50 bg-green-500/10";
      case "swap":
        return "border-purple-500/50 bg-purple-500/10";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        {getIcon(activeSuggestions[0]?.type, activeSuggestions[0]?.change)}
        {title}
      </h3>
      <div className="space-y-3">
        <AnimatePresence>
          {activeSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border-2 ${getTypeColor(suggestion.type)}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getIcon(suggestion.type, suggestion.change)}
                    <span className="text-sm font-semibold text-slate-300">
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </div>
                  <div className="font-semibold text-white mb-1">
                    {suggestion.exerciseName}
                  </div>
                  {suggestion.type === "weight" && (
                    <div className="text-sm font-mono text-slate-300">
                      {suggestion.current}lbs →{" "}
                      <span className="text-blue-500 font-bold">
                        {suggestion.suggested}lbs
                      </span>
                    </div>
                  )}
                  {suggestion.type === "volume" && (
                    <div className="text-sm font-mono text-slate-300">
                      {suggestion.change}
                    </div>
                  )}
                  {suggestion.type === "swap" && (
                    <div className="text-sm font-mono text-slate-300">
                      {suggestion.from} →{" "}
                      <span className="text-purple-500 font-bold">
                        {suggestion.to}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApply(suggestion.id)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    title="Apply suggestion"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(suggestion.id)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-400">{suggestion.reason}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

