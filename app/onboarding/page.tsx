"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { generatePlan, UserProfile, GeneratedPlan, SplitPreference, FocusArea, getSwapAlternatives } from "@/lib/apex-data";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, X, RefreshCw } from "lucide-react";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { setPlan, setProfile: setProfileContext } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [showSwap, setShowSwap] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!profile.goal || !profile.experienceLevel || !profile.metabolismType || !profile.daysPerWeek || !profile.splitPreference || !profile.focusAreas) {
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const plan = generatePlan(profile as UserProfile);
      setGeneratedPlan(plan);
      setIsGenerating(false);
      // Save to context
      setPlan(plan);
      setProfileContext(profile as UserProfile);
    }, 2000);
  };

  const handleDeleteExercise = (dayId: string, exerciseId: string) => {
    if (!generatedPlan) return;
    
    const updatedDays = generatedPlan.days.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
        };
      }
      return day;
    });
    
    setGeneratedPlan({ ...generatedPlan, days: updatedDays });
  };

  const handleSwapExercise = (dayId: string, exerciseId: string, newExercise: string) => {
    if (!generatedPlan) return;
    
    const updatedDays = generatedPlan.days.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              // Find the exercise in database to get its properties
              const alternatives = getSwapAlternatives(ex.name);
              // For now, just update the name - in real app would fetch full exercise data
              return { ...ex, name: newExercise };
            }
            return ex;
          }),
        };
      }
      return day;
    });
    
    setGeneratedPlan({ ...generatedPlan, days: updatedDays });
    setShowSwap(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step >= s ? "bg-blue-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Bio & Goals */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
                <p className="text-slate-400">We'll create a personalized plan</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Main Goal
                  </label>
                  <select
                    value={profile.goal || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, goal: e.target.value as UserProfile["goal"] })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select goal...</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Strength">Strength</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Split Preference
                  </label>
                  <select
                    value={profile.splitPreference || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, splitPreference: e.target.value as SplitPreference })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select split...</option>
                    <option value="AI Decide">AI Decide</option>
                    <option value="Push/Pull/Legs">Push/Pull/Legs</option>
                    <option value="Upper/Lower">Upper/Lower</option>
                    <option value="Arnold Split">Arnold Split</option>
                    <option value="Full Body">Full Body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setProfile({ ...profile, experienceLevel: level })
                        }
                        className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                          profile.experienceLevel === level
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Metabolism Type
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Not sure? Choose "Normal" if you're unsure. Fast = high calorie burn, quick recovery. Slow = lower calorie burn, slower recovery.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Fast", "Normal", "Slow"] as const).map((type) => {
                      const descriptions: Record<string, string> = {
                        Fast: "High calorie burn, quick recovery. Can handle more volume.",
                        Normal: "Average metabolism. Balanced approach works best.",
                        Slow: "Lower calorie burn, slower recovery. Focus on quality over quantity.",
                      };
                      return (
                        <button
                          key={type}
                          onClick={() =>
                            setProfile({ ...profile, metabolismType: type })
                          }
                          className={`px-4 py-3 rounded-lg border-2 transition-colors text-left ${
                            profile.metabolismType === type
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          <div className="font-semibold mb-1">{type}</div>
                          <div className="text-xs text-slate-400">{descriptions[type]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Focus Areas (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["Chest", "Arms", "Glutes", "Mobility/Health"] as FocusArea[]).map((area) => {
                      const isSelected = profile.focusAreas?.includes(area);
                      return (
                        <button
                          key={area}
                          onClick={() => {
                            const current = profile.focusAreas || [];
                            setProfile({
                              ...profile,
                              focusAreas: isSelected
                                ? current.filter((a) => a !== area)
                                : [...current, area],
                            });
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-800 bg-slate-900 hover:border-slate-700"
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!profile.goal || !profile.experienceLevel || !profile.metabolismType || !profile.splitPreference}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Constraints */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Your constraints</h1>
                <p className="text-slate-400">Help us tailor the perfect schedule</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Days per week: <span className="text-blue-500 font-mono font-bold">{profile.daysPerWeek || 3}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={profile.daysPerWeek || 3}
                    onChange={(e) =>
                      setProfile({ ...profile, daysPerWeek: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>1</span>
                    <span>7</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!profile.daysPerWeek}
                  className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generation & Editing */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Protocol</h1>
                <p className="text-slate-400">Review and customize your plan</p>
              </div>

              {!generatedPlan && !isGenerating && (
                <div className="text-center py-12">
                  <button
                    onClick={handleGenerate}
                    className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Protocol
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Analyzing Biology...</p>
                    <p className="text-slate-400 text-sm">Creating your personalized protocol</p>
                  </div>
                </div>
              )}

              {generatedPlan && (
                <div className="space-y-6">
                  {/* Rationale */}
                  <div className="p-4 bg-blue-500/10 border-2 border-blue-500/50 rounded-lg">
                    <p className="text-sm text-slate-300">{generatedPlan.rationale}</p>
                  </div>

                  {/* Plan Display */}
                  <div className="space-y-4">
                    {generatedPlan.days.map((day) => (
                      <div
                        key={day.id}
                        className="bg-slate-900 border-2 border-slate-800 rounded-lg p-4"
                      >
                        <h3 className="text-xl font-bold mb-4">{day.name}</h3>
                        <div className="space-y-2">
                          {day.exercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between p-3 bg-slate-800 rounded-lg group relative"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold">{exercise.name}</div>
                                  {exercise.alternatives && exercise.alternatives.length > 0 && (
                                    <button
                                      onClick={() => setShowSwap(showSwap === exercise.id ? null : exercise.id)}
                                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                                    >
                                      <RefreshCw className="w-4 h-4 text-slate-400" />
                                    </button>
                                  )}
                                </div>
                                <div className="text-sm text-slate-400 font-mono mt-1">
                                  {exercise.sets}×{exercise.reps}
                                </div>
                                {exercise.movementPattern && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {exercise.movementPattern}
                                  </div>
                                )}
                                {exercise.reasoning && (
                                  <div className="text-xs text-slate-400 mt-2 p-2 bg-slate-900/50 border border-slate-700 rounded">
                                    <span className="text-blue-500 font-semibold">Why: </span>
                                    {exercise.reasoning}
                                  </div>
                                )}
                              </div>
                              {editingPlan && (
                                <button
                                  onClick={() => handleDeleteExercise(day.id, exercise.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity ml-2"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              )}

                              {/* Swap Menu */}
                              {showSwap === exercise.id && exercise.alternatives && exercise.alternatives.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 p-4 bg-slate-900 border-2 border-slate-700 rounded-lg z-10 shadow-xl">
                                  <div className="text-sm mb-2 font-semibold text-slate-300">
                                    Swap for biomechanical equivalent:
                                  </div>
                                  <div className="space-y-2">
                                    {exercise.alternatives.map((alt) => (
                                      <button
                                        key={alt}
                                        onClick={() => handleSwapExercise(day.id, exercise.id, alt)}
                                        className="w-full text-left p-2 hover:bg-slate-800 rounded transition-colors"
                                      >
                                        {alt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Toggle */}
                  <button
                    onClick={() => setEditingPlan(!editingPlan)}
                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    {editingPlan ? "Done Editing" : "Edit Plan"}
                  </button>

                  {/* Complete Button */}
                  <button
                    onClick={() => router.push("/plan")}
                    className="w-full py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    View Weekly Plan
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

