import { RIR, Exercise, WorkoutDay, GeneratedPlan } from "./apex-data";

export interface LoggedSet {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  rir: RIR;
  timestamp: Date;
}

export interface WorkoutSession {
  id: string;
  dayId: string;
  dayName: string;
  date: Date;
  sets: LoggedSet[];
  completed: boolean;
  duration?: number; // in minutes
}

export interface AISuggestion {
  id: string;
  type: "weight" | "volume" | "swap";
  exerciseId?: string;
  exerciseName: string;
  current?: number | string;
  suggested?: number | string;
  change?: string;
  from?: string;
  to?: string;
  reason: string;
  timestamp: Date;
  applied: boolean;
}

export interface WeeklyReview {
  weekStart: Date;
  weekEnd: Date;
  workoutsCompleted: number;
  totalWorkouts: number;
  suggestions: AISuggestion[];
  progressSummary: string;
}

// Storage keys
const STORAGE_KEYS = {
  PLAN: "apex_plan",
  WORKOUTS: "apex_workouts",
  SUGGESTIONS: "apex_suggestions",
  PROFILE: "apex_profile",
} as const;

// Save workout session
export function saveWorkout(session: WorkoutSession): void {
  if (typeof window === "undefined") return;
  const workouts = getWorkoutHistory();
  workouts.push(session);
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
}

// Get all workout history
export function getWorkoutHistory(): WorkoutSession[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
  if (!stored) return [];
  
  const workouts = JSON.parse(stored);
  // Convert date strings back to Date objects
  return workouts.map((w: any) => ({
    ...w,
    date: new Date(w.date),
    sets: w.sets.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp),
    })),
  }));
}

// Get workouts for a specific day
export function getWorkoutsForDay(dayId: string): WorkoutSession[] {
  return getWorkoutHistory().filter((w) => w.dayId === dayId);
}

// Get most recent workout for an exercise
export function getLastWorkoutForExercise(
  exerciseId: string
): WorkoutSession | null {
  const workouts = getWorkoutHistory();
  for (const workout of workouts.reverse()) {
    const set = workout.sets.find((s) => s.exerciseId === exerciseId);
    if (set) return workout;
  }
  return null;
}

// Get weekly review data
export function getWeeklyReview(weekStart: Date): WeeklyReview {
  if (typeof window === "undefined") {
    return {
      weekStart,
      weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
      workoutsCompleted: 0,
      totalWorkouts: 0,
      suggestions: [],
      progressSummary: "",
    };
  }
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const workouts = getWorkoutHistory().filter(
    (w) => w.date >= weekStart && w.date <= weekEnd
  );
  
  const completed = workouts.filter((w) => w.completed).length;
  const plan = getSavedPlan();
  const totalWorkouts = plan?.days.length || 0;
  
  const suggestions = getAISuggestions().filter(
    (s) => s.timestamp >= weekStart && s.timestamp <= weekEnd && !s.applied
  );
  
  let progressSummary = "";
  if (completed === 0) {
    progressSummary = "No workouts completed this week. Let's get started!";
  } else if (completed < totalWorkouts * 0.5) {
    progressSummary = `You completed ${completed} of ${totalWorkouts} workouts. Consider increasing consistency.`;
  } else if (completed < totalWorkouts) {
    progressSummary = `Great progress! You completed ${completed} of ${totalWorkouts} workouts.`;
  } else {
    progressSummary = `Excellent! You completed all ${completed} workouts this week.`;
  }
  
  return {
    weekStart,
    weekEnd,
    workoutsCompleted: completed,
    totalWorkouts,
    suggestions,
    progressSummary,
  };
}

// Save AI suggestion
export function saveAISuggestion(suggestion: AISuggestion): void {
  if (typeof window === "undefined") return;
  const suggestions = getAISuggestions();
  suggestions.push(suggestion);
  localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(suggestions));
}

// Get all AI suggestions
export function getAISuggestions(): AISuggestion[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
  if (!stored) return [];
  
  const suggestions = JSON.parse(stored);
  return suggestions.map((s: any) => ({
    ...s,
    timestamp: new Date(s.timestamp),
  }));
}

// Mark suggestion as applied
export function applySuggestion(suggestionId: string): void {
  if (typeof window === "undefined") return;
  const suggestions = getAISuggestions();
  const updated = suggestions.map((s) =>
    s.id === suggestionId ? { ...s, applied: true } : s
  );
  localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(updated));
}

// Save generated plan
export function savePlan(plan: GeneratedPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
}

// Get saved plan
export function getSavedPlan(): GeneratedPlan | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
  if (!stored) return null;
  return JSON.parse(stored);
}

// Save user profile
export function saveProfile(profile: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

// Get user profile
export function getProfile(): any | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!stored) return null;
  return JSON.parse(stored);
}

