"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockCohortMembers } from "@/lib/apex-data";
import { Users, Trophy, MapPin, Target } from "lucide-react";

export default function CohortPage() {
  const [rivals, setRivals] = useState<string[]>([]);

  const handleRival = (memberId: string) => {
    setRivals((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Cohort</h1>
          </div>
          <p className="text-slate-400">
            Hypertrophy / 6-Day Split • Within 25 miles
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {mockCohortMembers.map((member, index) => {
            const isRival = rivals.includes(member.id);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${
                  isRival
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {/* Member Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-mono font-bold text-blue-500">
                      {member.username.split("_")[1]}
                    </div>
                    <div>
                      <div className="font-semibold">{member.username}</div>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {member.distance}
                      </div>
                    </div>
                  </div>
                  {member.recentLift.isPR && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold">PR</span>
                    </div>
                  )}
                </div>

                {/* Lift Info */}
                <div className="mb-4 p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{member.recentLift.exercise}</div>
                    <div className="text-xs text-slate-400">
                      {formatTime(member.recentLift.timestamp)}
                    </div>
                  </div>
                  <div className="font-mono text-2xl font-bold text-blue-500">
                    {member.recentLift.weight}lbs × {member.recentLift.reps}
                  </div>
                </div>

                {/* Comparison Bar (if matched) */}
                {member.matchedLift && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-400 mb-2">
                      Matched your {member.matchedLift.exercise} PR
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">You</span>
                        <span className="text-xs font-mono text-slate-300">
                          {member.matchedLift.yourWeight}lbs
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{
                            width: `${
                              (member.matchedLift.yourWeight /
                                member.matchedLift.theirWeight) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {member.username}
                        </span>
                        <span className="text-xs font-mono text-blue-500 font-bold">
                          {member.matchedLift.theirWeight}lbs
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rival Button */}
                <button
                  onClick={() => handleRival(member.id)}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    isRival
                      ? "bg-slate-800 text-slate-400"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isRival ? "Rivaled" : "Rival"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Rivals Leaderboard */}
        {rivals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-slate-900 border-2 border-blue-500/50 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold">Your Rivals</h2>
            </div>
            <div className="space-y-2">
              {rivals.map((rivalId) => {
                const member = mockCohortMembers.find((m) => m.id === rivalId);
                if (!member) return null;
                return (
                  <div
                    key={rivalId}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="font-semibold">{member.username}</div>
                    <div className="text-sm text-slate-400 font-mono">
                      {member.recentLift.weight}lbs
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

