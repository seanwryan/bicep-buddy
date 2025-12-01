export type RIR = 0 | 1 | 2 | 3 | 4 | 5;
export type Goal = "Gain Muscle" | "Lose Weight" | "Strength" | "Endurance";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";
export type MetabolismType = "Fast" | "Normal" | "Slow";
export type SplitPreference = "AI Decide" | "Push/Pull/Legs" | "Upper/Lower" | "Arnold Split" | "Full Body";
export type FocusArea = "Chest" | "Arms" | "Glutes" | "Mobility/Health";

export interface UserProfile {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  metabolismType: MetabolismType;
  daysPerWeek: number;
  splitPreference: SplitPreference;
  focusAreas: FocusArea[];
}

export interface MovementPattern {
  id: string;
  pattern: string; // e.g., "Vertical Pull", "Horizontal Push"
  muscleGroup: string;
  lockedUntil?: Date; // Locked for 4 weeks once chosen
}

export interface Exercise {
  id: string;
  name: string;
  movementPattern: string; // e.g., "Vertical Pull"
  muscleGroup: string;
  sets: number;
  reps: number;
  weight?: number;
  reasoning: string; // Why this exercise was selected
  alternatives: string[]; // Biomechanical equivalents for swapping
  previousSession?: {
    weight: number;
    reps: number;
  };
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface GeneratedPlan {
  split: string;
  days: WorkoutDay[];
  rationale: string;
}

export interface LoggedSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  rir: RIR;
  timestamp: Date;
}

export interface CohortMember {
  id: string;
  username: string;
  distance: string;
  goal: Goal;
  split: string;
  recentLift: {
    exercise: string;
    weight: number;
    reps: number;
    isPR: boolean;
    timestamp: Date;
  };
  matchedLift?: {
    exercise: string;
    yourWeight: number;
    theirWeight: number;
  };
}

// RIR to color mapping
export function getRIRColor(rir: RIR): string {
  if (rir === 0) return "bg-red-500";
  if (rir <= 2) return "bg-yellow-500";
  return "bg-green-500";
}

// RIR to label
export function getRIRLabel(rir: RIR): string {
  if (rir === 0) return "Failure / Empty Tank";
  if (rir <= 2) return "Optimal Stimulus";
  return "Warmup / Too Easy";
}

// Exercise database with reasoning and alternatives
const exerciseDatabase: Record<string, {
  reasoning: string;
  alternatives: string[];
  previousSession?: { weight: number; reps: number };
}> = {
  "Barbell Bench Press": {
    reasoning: "Optimal for chest hypertrophy with high stimulus-to-fatigue ratio. Targets the entire pectoral complex with minimal joint stress.",
    alternatives: ["Dumbbell Bench Press", "Incline Barbell Press", "Cable Flyes"],
    previousSession: { weight: 185, reps: 8 },
  },
  "Incline Cable Fly": {
    reasoning: "Superior to standard pushups for hypertrophy. Cable resistance maintains constant tension through full ROM, targeting upper chest fibers.",
    alternatives: ["Incline Dumbbell Fly", "Pec Deck", "Cable Crossover"],
    previousSession: { weight: 30, reps: 12 },
  },
  "Face Pulls": {
    reasoning: "Essential for shoulder health to counteract your heavy pressing volume. Targets rear delts and external rotators, preventing impingement.",
    alternatives: ["Rear Delt Flyes", "Band Pull-Aparts", "Reverse Pec Deck"],
    previousSession: { weight: 25, reps: 15 },
  },
  "Back Squat": {
    reasoning: "Primary lower body compound movement. Highest loading potential for quad and glute development with core stability benefits.",
    alternatives: ["Hack Squat", "Bulgarian Split Squat", "Front Squat"],
    previousSession: { weight: 225, reps: 8 },
  },
  "Deadlift": {
    reasoning: "Posterior chain developer. Targets hamstrings, glutes, and erectors with unmatched loading capacity for strength and size.",
    alternatives: ["Romanian Deadlift", "Trap Bar Deadlift", "Rack Pulls"],
    previousSession: { weight: 315, reps: 5 },
  },
  "Lat Pulldown": {
    reasoning: "Vertical pull pattern for lat width. Allows progressive overload without bodyweight limitations, ideal for hypertrophy.",
    alternatives: ["Weighted Pull-Ups", "Meadows Row", "Cable Pulldown"],
    previousSession: { weight: 120, reps: 10 },
  },
  "Zottman Curls": {
    reasoning: "Hits both bicep and brachialis, adding width to the arm. The eccentric pronation targets the brachialis, which most curl variations miss.",
    alternatives: ["Hammer Curls", "Cross-Body Curls", "Cable Curls"],
    previousSession: { weight: 25, reps: 10 },
  },
};

// Mock plan generation with slot system
export function generatePlan(profile: UserProfile): GeneratedPlan {
  // Determine split
  let split = "Push/Pull/Legs";
  if (profile.splitPreference !== "AI Decide") {
    split = profile.splitPreference;
  } else {
    split = profile.daysPerWeek >= 6 ? "Push/Pull/Legs" : profile.daysPerWeek >= 4 ? "Upper/Lower" : "Full Body";
  }
  
  const days: WorkoutDay[] = [];
  const hasMobility = profile.focusAreas.includes("Mobility/Health");
  
  if (split === "Push/Pull/Legs") {
    // Push Day 1
    const pushExercises: Exercise[] = [];
    
    // Add mobility warmup if selected
    if (hasMobility) {
      pushExercises.push({
        id: "warmup-1",
        name: "Dynamic Shoulder Warmup",
        movementPattern: "Warmup",
        muscleGroup: "Shoulders",
        sets: 1,
        reps: 10,
        reasoning: "5-minute dynamic warmup targeting shoulder mobility and activation. Prepares rotator cuff and scapular stabilizers for heavy pressing.",
        alternatives: [],
      });
    }
    
    // Compound Heavy Lift
    pushExercises.push({
      id: "ex-1",
      name: "Barbell Bench Press",
      movementPattern: "Horizontal Push",
      muscleGroup: "Chest",
      sets: 4,
      reps: 8,
      ...exerciseDatabase["Barbell Bench Press"],
    });
    
    // Secondary compound
    pushExercises.push({
      id: "ex-2",
      name: "Overhead Press",
      movementPattern: "Vertical Push",
      muscleGroup: "Shoulders",
      sets: 3,
      reps: 8,
      reasoning: "Vertical pressing pattern for anterior deltoids. Complements horizontal pressing for complete shoulder development.",
      alternatives: ["Dumbbell Shoulder Press", "Arnold Press", "Push Press"],
      previousSession: { weight: 135, reps: 8 },
    });
    
    // Isolation/Hypertrophy
    if (profile.focusAreas.includes("Chest")) {
      pushExercises.push({
        id: "ex-3",
        name: "Incline Cable Fly",
        movementPattern: "Isolation",
        muscleGroup: "Chest",
        sets: 3,
        reps: 12,
        ...exerciseDatabase["Incline Cable Fly"],
      });
    }
    
    // Health/Mobility exercise
    pushExercises.push({
      id: "ex-4",
      name: "Face Pulls",
      movementPattern: "Horizontal Pull",
      muscleGroup: "Rear Delts",
      sets: 3,
      reps: 15,
      ...exerciseDatabase["Face Pulls"],
    });
    
    // Finisher
    pushExercises.push({
      id: "ex-5",
      name: "Tricep Dips",
      movementPattern: "Isolation",
      muscleGroup: "Triceps",
      sets: 3,
      reps: 10,
      reasoning: "Tricep finisher with bodyweight progression. Targets all three tricep heads for complete arm development.",
      alternatives: ["Overhead Tricep Extension", "Close-Grip Bench", "Cable Pushdowns"],
      previousSession: { weight: 0, reps: 10 },
    });
    
    days.push({
      id: "push-1",
      name: "Push Day 1",
      exercises: pushExercises,
    });
    
    // Pull Day 1
    const pullExercises: Exercise[] = [];
    if (hasMobility) {
      pullExercises.push({
        id: "warmup-2",
        name: "Dynamic Back Warmup",
        movementPattern: "Warmup",
        muscleGroup: "Back",
        sets: 1,
        reps: 10,
        reasoning: "Activates lats and scapular retractors. Prepares posterior chain for heavy pulling.",
        alternatives: [],
      });
    }
    pullExercises.push({
      id: "ex-6",
      name: "Deadlift",
      movementPattern: "Hip Hinge",
      muscleGroup: "Back",
      sets: 4,
      reps: 5,
      ...exerciseDatabase["Deadlift"],
    });
    pullExercises.push({
      id: "ex-7",
      name: "Lat Pulldown",
      movementPattern: "Vertical Pull",
      muscleGroup: "Back",
      sets: 4,
      reps: 10,
      ...exerciseDatabase["Lat Pulldown"],
    });
    if (profile.focusAreas.includes("Arms")) {
      pullExercises.push({
        id: "ex-8",
        name: "Zottman Curls",
        movementPattern: "Isolation",
        muscleGroup: "Biceps",
        sets: 3,
        reps: 10,
        ...exerciseDatabase["Zottman Curls"],
      });
    }
    
    days.push({
      id: "pull-1",
      name: "Pull Day 1",
      exercises: pullExercises,
    });
    
    // Leg Day 1
    const legExercises: Exercise[] = [];
    if (hasMobility) {
      legExercises.push({
        id: "warmup-3",
        name: "Dynamic Lower Body Warmup",
        movementPattern: "Warmup",
        muscleGroup: "Legs",
        sets: 1,
        reps: 10,
        reasoning: "Hip mobility and activation drills. Prepares hip flexors, glutes, and quads for heavy loading.",
        alternatives: [],
      });
    }
    legExercises.push({
      id: "ex-10",
      name: "Back Squat",
      movementPattern: "Squat",
      muscleGroup: "Legs",
      sets: 4,
      reps: 8,
      ...exerciseDatabase["Back Squat"],
    });
    legExercises.push({
      id: "ex-11",
      name: "Romanian Deadlift",
      movementPattern: "Hip Hinge",
      muscleGroup: "Legs",
      sets: 3,
      reps: 8,
      reasoning: "Hamstring and glute developer with emphasis on eccentric loading. Complements squat pattern.",
      alternatives: ["Leg Curls", "Good Mornings", "Single-Leg RDL"],
      previousSession: { weight: 225, reps: 8 },
    });
    if (profile.focusAreas.includes("Glutes")) {
      legExercises.push({
        id: "ex-12",
        name: "Hip Thrust",
        movementPattern: "Hip Extension",
        muscleGroup: "Glutes",
        sets: 3,
        reps: 12,
        reasoning: "Direct glute activation with high loading potential. Targets glute max for size and strength.",
        alternatives: ["Bulgarian Split Squat", "Lunges", "Step-Ups"],
        previousSession: { weight: 185, reps: 12 },
      });
    }
    
    days.push({
      id: "legs-1",
      name: "Leg Day 1",
      exercises: legExercises,
    });
  }

  let rationale = `Generated a ${split} split optimized for ${profile.goal.toLowerCase()}. `;
  if (profile.metabolismType === "Fast") {
    rationale += "Higher volume programming to match your fast metabolism. ";
  }
  if (hasMobility) {
    rationale += "Dynamic warmups included for mobility and injury prevention. ";
  }
  if (profile.experienceLevel === "Beginner") {
    rationale += "Progressive overload structure suitable for beginners.";
  } else {
    rationale += "Advanced periodization with varied rep ranges and optimal exercise selection.";
  }

  return {
    split,
    days,
    rationale,
  };
}

// Get swap alternatives for an exercise
export function getSwapAlternatives(exerciseName: string): string[] {
  return exerciseDatabase[exerciseName]?.alternatives || [];
}

// Mock cohort members
export const mockCohortMembers: CohortMember[] = [
  {
    id: "cohort-1",
    username: "User_99",
    distance: "2 miles",
    goal: "Gain Muscle",
    split: "6-Day Split",
    recentLift: {
      exercise: "Bench Press",
      weight: 225,
      reps: 5,
      isPR: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    matchedLift: {
      exercise: "Bench Press",
      yourWeight: 205,
      theirWeight: 225,
    },
  },
  {
    id: "cohort-2",
    username: "User_42",
    distance: "5 miles",
    goal: "Gain Muscle",
    split: "6-Day Split",
    recentLift: {
      exercise: "Back Squat",
      weight: 315,
      reps: 8,
      isPR: false,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  },
  {
    id: "cohort-3",
    username: "User_17",
    distance: "1 mile",
    goal: "Gain Muscle",
    split: "6-Day Split",
    recentLift: {
      exercise: "Deadlift",
      weight: 405,
      reps: 3,
      isPR: true,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  },
];

