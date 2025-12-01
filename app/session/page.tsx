"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FuelGauge from "@/components/FuelGauge";
import AISuggestions from "@/components/AISuggestions";
import { useApp } from "../context/AppContext";
import { RIR, WorkoutDay } from "@/lib/apex-data";
import {
  WorkoutSession,
  LoggedSet,
  getLastWorkoutForExercise,
} from "@/lib/workout-storage";
import { analyzeWorkout } from "@/lib/ai-analysis";
import { CheckCircle2, Plus, ArrowLeft } from "lucide-react";

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plan, addWorkout, addSuggestion, suggestions, refreshData } = useApp();
  
  const dayId = searchParams.get("day");
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutDay | null>(null);
  const [loggedSets, setLoggedSets] = useState<
    Record<string, Array<{ weight: number; reps: number; rir: RIR }>>
  >({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentRIR, setCurrentRIR] = useState<RIR>(2);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [immediateSuggestions, setImmediateSuggestions] = useState<
    typeof suggestions
  >([]);

  // Load workout from plan
  useEffect(() => {
    if (!plan) {
      router.push("/plan");
      return;
    }

    if (dayId) {
      const workout = plan.days.find((d) => d.id === dayId);
      if (workout) {
        setCurrentWorkout(workout);
        // Load previous session data for exercises
        workout.exercises.forEach((ex) => {
          const lastWorkout = getLastWorkoutForExercise(ex.id);
          if (lastWorkout) {
            const lastSet = lastWorkout.sets.find((s) => s.exerciseId === ex.id);
            if (lastSet) {
              ex.previousSession = {
                weight: lastSet.weight,
                reps: lastSet.reps,
              };
            }
          }
        });
      } else {
        router.push("/plan");
      }
    } else {
      // Default to first workout day
      if (plan.days.length > 0) {
        setCurrentWorkout(plan.days[0]);
      }
    }
  }, [plan, dayId, router]);

  const handleOpenLogModal = (exerciseId: string) => {
    if (!currentWorkout) return;
    const exercise = currentWorkout.exercises.find((e) => e.id === exerciseId);
    if (exercise?.previousSession) {
      setCurrentWeight(exercise.previousSession.weight);
      setCurrentReps(exercise.previousSession.reps);
    } else {
      setCurrentWeight(0);
      setCurrentReps(0);
    }
    setCurrentRIR(2);
    setActiveExercise(exerciseId);
  };

  const handleLogSet = (exerciseId: string) => {
    if (currentWeight <= 0 || currentReps <= 0) return;

    setLoggedSets((prev) => ({
      ...prev,
      [exerciseId]: [
        ...(prev[exerciseId] || []),
        { weight: currentWeight, reps: currentReps, rir: currentRIR },
      ],
    }));

    // Reset form
    setCurrentWeight(0);
    setCurrentReps(0);
    setCurrentRIR(2);
    setActiveExercise(null);
  };

  const handleCompleteWorkout = () => {
    if (!currentWorkout) return;

    // Check if all exercises are completed
    const allCompleted = currentWorkout.exercises.every((ex) => {
      const sets = loggedSets[ex.id] || [];
      return sets.length >= ex.sets;
    });

    if (!allCompleted) return;

    // Create workout session
    const sessionSets: LoggedSet[] = [];
    for (const [exerciseId, sets] of Object.entries(loggedSets)) {
      const exercise = currentWorkout.exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        sets.forEach((set) => {
          sessionSets.push({
            exerciseId: exerciseId,
            exerciseName: exercise.name,
            weight: set.weight,
            reps: set.reps,
            rir: set.rir,
            timestamp: new Date(),
          });
        });
      }
    }

    const session: WorkoutSession = {
      id: `workout-${Date.now()}`,
      dayId: currentWorkout.id,
      dayName: currentWorkout.name,
      date: new Date(),
      sets: sessionSets,
      completed: true,
    };

    // Save workout
    addWorkout(session);

    // Trigger AI analysis
    const aiSuggestions = analyzeWorkout(session, currentWorkout);
    aiSuggestions.forEach((suggestion) => {
      addSuggestion(suggestion);
    });

    setImmediateSuggestions(aiSuggestions);
    setWorkoutCompleted(true);
    refreshData();
  };

  const handleApplySuggestion = (id: string) => {
    // For now, just mark as applied
    // In full implementation, would update the plan
    addSuggestion({
      id: `applied-${id}`,
      type: "weight",
      exerciseName: "",
      reason: "",
      timestamp: new Date(),
      applied: true,
    });
    setImmediateSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );
  };

  const getCompletedSets = (exerciseId: string): number => {
    return loggedSets[exerciseId]?.length || 0;
  };

  if (!currentWorkout) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allExercisesCompleted = currentWorkout.exercises.every((ex) => {
    const sets = loggedSets[ex.id] || [];
    return sets.length >= ex.sets;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/plan")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plan
          </button>
          <h1 className="text-3xl font-bold mb-2">{currentWorkout.name}</h1>
          <p className="text-slate-400">Track your sets with RIR</p>
        </div>

        {/* Exercise List */}
        <div className="space-y-4 mb-6">
          {currentWorkout.exercises.map((exercise, index) => {
            const completedSets = getCompletedSets(exercise.id);
            const isComplete = completedSets >= exercise.sets;

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${
                  isComplete
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{exercise.name}</h3>
                    <div className="text-sm text-slate-400 font-mono mt-1">
                      {exercise.sets}×{exercise.reps}
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                {/* Logged Sets */}
                {loggedSets[exercise.id] && loggedSets[exercise.id].length > 0 && (
                  <div className="mb-4 space-y-2">
                    {loggedSets[exercise.id].map((set, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-800 rounded-lg"
                      >
                        <div className="font-mono text-sm">
                          Set {idx + 1}: {set.weight}lbs × {set.reps}
                        </div>
                        <div className="text-xs text-slate-400">
                          {set.rir} RIR
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Log Set Button */}
                {!isComplete && (
                  <button
                    onClick={() => handleOpenLogModal(exercise.id)}
                    className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Log Set ({completedSets}/{exercise.sets})
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Log Set Modal */}
        {activeExercise && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Log Set</h2>

              <div className="space-y-6">
                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={currentWeight || ""}
                    onChange={(e) => setCurrentWeight(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {activeExercise && (() => {
                    const exercise = currentWorkout.exercises.find((e) => e.id === activeExercise);
                    if (exercise?.previousSession && currentWeight === exercise.previousSession.weight) {
                      return <div className="text-xs text-slate-500 mt-1">Auto-filled from last session</div>;
                    }
                    return null;
                  })()}
                </div>

                {/* Reps Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={currentReps || ""}
                    onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {activeExercise && currentWorkout && (() => {
                    const exercise = currentWorkout.exercises.find((e) => e.id === activeExercise);
                    if (exercise?.previousSession && currentReps === exercise.previousSession.reps) {
                      return <div className="text-xs text-slate-500 mt-1">Auto-filled from last session</div>;
                    }
                    return null;
                  })()}
                </div>

                {/* Fuel Gauge */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Reps In Reserve (RIR)
                  </label>
                  <FuelGauge value={currentRIR} onChange={setCurrentRIR} />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActiveExercise(null);
                      setCurrentWeight(0);
                      setCurrentReps(0);
                      setCurrentRIR(2);
                    }}
                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleLogSet(activeExercise)}
                    disabled={currentWeight <= 0 || currentReps <= 0}
                    className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Log Set
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Complete Workout Button */}
        {allExercisesCompleted && !workoutCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={handleCompleteWorkout}
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Complete Workout
            </button>
          </motion.div>
        )}

        {/* Workout Completed + AI Suggestions */}
        {workoutCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-green-500/20 border-2 border-green-500 rounded-xl text-center">
              <h3 className="text-xl font-bold mb-2">Workout Complete! 🎉</h3>
              <p className="text-slate-300">
                Your progress has been logged and analyzed.
              </p>
            </div>

            {immediateSuggestions.length > 0 && (
              <AISuggestions
                suggestions={immediateSuggestions}
                onApply={handleApplySuggestion}
                title="Immediate Feedback"
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
