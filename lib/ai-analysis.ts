import { RIR, Exercise, WorkoutDay } from "./apex-data";
import {
  WorkoutSession,
  AISuggestion,
  getWorkoutHistory,
  getLastWorkoutForExercise,
} from "./workout-storage";

// Analyze a completed workout for immediate feedback
export function analyzeWorkout(
  session: WorkoutSession,
  planDay: WorkoutDay
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Analyze each exercise in the session
  for (const set of session.sets) {
    const exercise = planDay.exercises.find((e) => e.id === set.exerciseId);
    if (!exercise) continue;

    // Get history for this exercise
    const history = getWorkoutHistory()
      .filter((w) => w.completed)
      .flatMap((w) => w.sets)
      .filter((s) => s.exerciseId === set.exerciseId)
      .slice(-3); // Last 3 sessions

    if (history.length < 2) continue; // Need at least 2 data points

    // Weight progression suggestion
    const lowRIRCount = history.filter((s) => s.rir <= 2).length;
    if (lowRIRCount >= 2 && set.rir <= 2) {
      const currentWeight = set.weight;
      const suggestedWeight = Math.round(currentWeight * 1.05); // 5% increase

      suggestions.push({
        id: `weight-${set.exerciseId}-${Date.now()}`,
        type: "weight",
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        current: currentWeight,
        suggested: suggestedWeight,
        reason: `You've consistently hit ${set.rir} RIR on ${set.exerciseName}. Increase weight to ${suggestedWeight}lbs to maintain progressive overload.`,
        timestamp: new Date(),
        applied: false,
      });
    }

    // Volume adjustment for high RIR (too easy)
    if (set.rir >= 4) {
      suggestions.push({
        id: `volume-${set.exerciseId}-${Date.now()}`,
        type: "volume",
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        change: "+1 set",
        reason: `Your RIR of ${set.rir} indicates ${set.exerciseName} is too easy. Add 1 set to increase volume and stimulus.`,
        timestamp: new Date(),
        applied: false,
      });
    }

    // Volume reduction for failure (RIR 0)
    if (set.rir === 0 && history.filter((s) => s.rir === 0).length >= 2) {
      suggestions.push({
        id: `volume-reduce-${set.exerciseId}-${Date.now()}`,
        type: "volume",
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        change: "-1 set",
        reason: `You're hitting failure consistently on ${set.exerciseName}. Reduce volume by 1 set to allow better recovery and form.`,
        timestamp: new Date(),
        applied: false,
      });
    }
  }

  return suggestions;
}

// Generate comprehensive weekly review
export function generateWeeklyReview(
  weekStart: Date,
  plan: { days: WorkoutDay[] }
): AISuggestion[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekWorkouts = getWorkoutHistory().filter(
    (w) => w.completed && w.date >= weekStart && w.date <= weekEnd
  );

  const suggestions: AISuggestion[] = [];

  // Analyze each exercise across the week
  for (const day of plan.days) {
    for (const exercise of day.exercises) {
      const exerciseSets = weekWorkouts
        .flatMap((w) => w.sets)
        .filter((s) => s.exerciseId === exercise.id);

      if (exerciseSets.length === 0) continue;

      // Calculate average RIR
      const avgRIR =
        exerciseSets.reduce((sum, s) => sum + s.rir, 0) / exerciseSets.length;

      // Check for stagnation (no weight increase in 4+ weeks)
      const allHistory = getWorkoutHistory()
        .filter((w) => w.completed)
        .flatMap((w) => w.sets)
        .filter((s) => s.exerciseId === exercise.id);

      if (allHistory.length >= 8) {
        const recentWeights = allHistory.slice(-4).map((s) => s.weight);
        const olderWeights = allHistory.slice(-8, -4).map((s) => s.weight);
        const recentAvg = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
        const olderAvg = olderWeights.reduce((a, b) => a + b, 0) / olderWeights.length;

        // No progress (less than 2% increase)
        if (recentAvg <= olderAvg * 1.02 && exercise.alternatives.length > 0) {
          suggestions.push({
            id: `swap-${exercise.id}-${Date.now()}`,
            type: "swap",
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            from: exercise.name,
            to: exercise.alternatives[0],
            reason: `${exercise.name} shows no progress over the last 4 weeks. Consider swapping to ${exercise.alternatives[0]} for a new stimulus while maintaining the ${exercise.movementPattern} pattern.`,
            timestamp: new Date(),
            applied: false,
          });
        }
      }

      // Volume recommendation based on average RIR
      if (avgRIR > 3 && exerciseSets.length >= 3) {
        suggestions.push({
          id: `volume-weekly-${exercise.id}-${Date.now()}`,
          type: "volume",
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          change: "+1 set",
          reason: `Weekly average RIR of ${avgRIR.toFixed(1)} indicates ${exercise.name} is too easy. Increase volume by adding 1 set per session.`,
          timestamp: new Date(),
          applied: false,
        });
      }
    }
  }

  return suggestions;
}

// Get exercise progress summary
export function getExerciseProgress(exerciseId: string): {
  trend: "up" | "down" | "stable";
  avgRIR: number;
  weightChange: number;
} {
  const history = getWorkoutHistory()
    .filter((w) => w.completed)
    .flatMap((w) => w.sets)
    .filter((s) => s.exerciseId === exerciseId);

  if (history.length < 4) {
    return { trend: "stable", avgRIR: 2, weightChange: 0 };
  }

  const recent = history.slice(-4);
  const older = history.slice(-8, -4);

  const recentAvgWeight =
    recent.reduce((sum, s) => sum + s.weight, 0) / recent.length;
  const olderAvgWeight =
    older.length > 0
      ? older.reduce((sum, s) => sum + s.weight, 0) / older.length
      : recentAvgWeight;

  const avgRIR = recent.reduce((sum, s) => sum + s.rir, 0) / recent.length;
  const weightChange = recentAvgWeight - olderAvgWeight;

  let trend: "up" | "down" | "stable" = "stable";
  if (weightChange > 2) trend = "up";
  else if (weightChange < -2) trend = "down";

  return { trend, avgRIR, weightChange };
}

