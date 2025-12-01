"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GeneratedPlan, UserProfile } from "@/lib/apex-data";
import {
  WorkoutSession,
  AISuggestion,
  savePlan,
  getSavedPlan,
  saveProfile,
  getProfile,
  saveWorkout,
  getWorkoutHistory,
  saveAISuggestion,
  getAISuggestions,
  applySuggestion,
} from "@/lib/workout-storage";

interface AppContextType {
  plan: GeneratedPlan | null;
  profile: UserProfile | null;
  workouts: WorkoutSession[];
  suggestions: AISuggestion[];
  setPlan: (plan: GeneratedPlan) => void;
  setProfile: (profile: UserProfile) => void;
  addWorkout: (workout: WorkoutSession) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  applySuggestionById: (id: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<GeneratedPlan | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedPlan = getSavedPlan();
    const savedProfile = getProfile();
    const savedWorkouts = getWorkoutHistory();
    const savedSuggestions = getAISuggestions();

    if (savedPlan) setPlanState(savedPlan);
    if (savedProfile) setProfileState(savedProfile);
    setWorkouts(savedWorkouts);
    setSuggestions(savedSuggestions);
  }, []);

  const setPlan = (newPlan: GeneratedPlan) => {
    setPlanState(newPlan);
    if (typeof window !== "undefined") {
      savePlan(newPlan);
    }
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (typeof window !== "undefined") {
      saveProfile(newProfile);
    }
  };

  const addWorkout = (workout: WorkoutSession) => {
    setWorkouts((prev) => [...prev, workout]);
    if (typeof window !== "undefined") {
      saveWorkout(workout);
    }
  };

  const addSuggestion = (suggestion: AISuggestion) => {
    setSuggestions((prev) => [...prev, suggestion]);
    if (typeof window !== "undefined") {
      saveAISuggestion(suggestion);
    }
  };

  const applySuggestionById = (id: string) => {
    if (typeof window !== "undefined") {
      applySuggestion(id);
    }
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );
  };

  const refreshData = () => {
    if (typeof window !== "undefined") {
      setWorkouts(getWorkoutHistory());
      setSuggestions(getAISuggestions());
    }
  };

  return (
    <AppContext.Provider
      value={{
        plan,
        profile,
        workouts,
        suggestions,
        setPlan,
        setProfile,
        addWorkout,
        addSuggestion,
        applySuggestionById,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

