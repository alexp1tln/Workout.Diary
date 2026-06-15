export type ExerciseType = 'strength' | 'cardio' | 'flexibility';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  description?: string;
  isCustom?: boolean;
  avatarId?: string;
}

export interface SetRecord {
  id: string;
  reps?: number;
  weight?: number; // in kg or lbs
  incline?: number; // Наклон
  speed?: number; // Скорость (км/ч)
  time?: number; // Время (мин)
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: SetRecord[];
}

export interface Workout {
  id: string;
  title: string;
  date: string; // ISO string
  avatarUrl?: string; // Add avatar support
  notes?: string;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface InBodyResult {
  id: string;
  date: string;
  rawData: string;
  interpretation?: string;
  comparison?: string;
  metrics: { label: string; value: string; status: string }[];
}

export interface UserProfile {
  goals: string;
}
