"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { getWeeklyReview, getWorkoutsForDay } from "@/lib/workout-storage";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function PlanPage() {
  const router = useRouter();
  const { plan, workouts } = useApp();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Get start of week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => getWeekStart(currentWeek), [currentWeek]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Generate week days
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekStart]);

  // Map workout days to week schedule (simple rotation for now)
  const getWorkoutForDay = (date: Date): { dayId: string; dayName: string } | null => {
    if (!plan || plan.days.length === 0) return null;
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
    
    // Simple schedule: Mon, Wed, Fri for 3-day, or more frequent for higher days
    const scheduleMap: Record<number, number[]> = {
      3: [0, 2, 4], // Mon, Wed, Fri
      4: [0, 2, 4, 6], // Mon, Wed, Fri, Sun
      5: [0, 1, 3, 4, 6], // Mon, Tue, Thu, Fri, Sun
      6: [0, 1, 2, 3, 4, 5], // Mon-Sat
    };
    
    const schedule = scheduleMap[plan.days.length] || [0, 2, 4];
    const index = schedule.indexOf(adjustedDay);
    
    if (index === -1) return null;
    const workoutIndex = index % plan.days.length;
    return {
      dayId: plan.days[workoutIndex].id,
      dayName: plan.days[workoutIndex].name,
    };
  };

  // Check if workout is completed
  const isWorkoutCompleted = (dayId: string, date: Date): boolean => {
    const dayWorkouts = workouts.filter(
      (w) => w.dayId === dayId && w.date.toDateString() === date.toDateString()
    );
    return dayWorkouts.some((w) => w.completed);
  };

  // Check if today
  const isToday = (date: Date): boolean => {
    return date.toDateString() === new Date().toDateString();
  };

  const weeklyReview = useMemo(
    () => getWeeklyReview(weekStart),
    [weekStart, workouts]
  );

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl">No plan found</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Weekly Plan</h1>
          </div>
          <p className="text-slate-400">{plan.split} Split</p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="font-semibold">
              {weekStart.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekEnd.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </div>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="text-sm text-blue-500 hover:text-blue-400 mt-1"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => navigateWeek("next")}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {/* Day headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {weekDays.map((date, index) => {
            const workout = getWorkoutForDay(date);
            const completed = workout ? isWorkoutCompleted(workout.dayId, date) : false;
            const today = isToday(date);

            return (
              <motion.button
                key={date.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (workout) {
                    router.push(`/session?day=${workout.dayId}`);
                  }
                }}
                disabled={!workout}
                className={`p-4 rounded-xl border-2 transition-all min-h-[100px] flex flex-col items-center justify-center ${
                  today
                    ? "border-blue-500 bg-blue-500/10"
                    : completed
                    ? "border-green-500 bg-green-500/10"
                    : workout
                    ? "border-slate-800 bg-slate-900 hover:border-slate-700 cursor-pointer"
                    : "border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="text-lg font-bold mb-1">{date.getDate()}</div>
                {workout && (
                  <>
                    <div className="text-xs text-center text-slate-400 mb-2">
                      {workout.dayName}
                    </div>
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-500" />
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Weekly Progress */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Week Progress</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Workouts Completed</span>
              <span className="font-mono font-bold text-blue-500">
                {weeklyReview.workoutsCompleted} / {weeklyReview.totalWorkouts}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${
                    (weeklyReview.workoutsCompleted / weeklyReview.totalWorkouts) * 100
                  }%`,
                }}
              />
            </div>
            <p className="text-sm text-slate-300 mt-2">{weeklyReview.progressSummary}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-blue-500 mb-1">
              {workouts.filter((w) => w.completed).length}
            </div>
            <div className="text-xs text-slate-400">Total Workouts</div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-green-500 mb-1">
              {plan.days.length}
            </div>
            <div className="text-xs text-slate-400">Workout Days</div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-yellow-500 mb-1">
              {weeklyReview.suggestions.length}
            </div>
            <div className="text-xs text-slate-400">Suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

