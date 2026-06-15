import React, { useState, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Workout, WorkoutExercise, SetRecord, Exercise } from "../types";
import { defaultExercises } from "../data/exercisesDb";
import { v4 as uuidv4 } from "uuid";
import { ExerciseAvatar, EXERCISE_AVATARS } from "./ExerciseAvatar";
import { FitnessTrendsChart } from "./FitnessTrendsChart";
import { WorkoutPlannerHeatmap } from "./WorkoutPlannerHeatmap";
import {
  PlusCircle,
  Dumbbell,
  Trash2,
  ChevronLeft,
  Flame,
  TrendingUp,
  Activity,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

function calculateStats(workouts: Workout[]) {
  let tonnage = 0;
  workouts.forEach((w) => {
    w.exercises.forEach((we) => {
      we.sets.forEach((s) => {
        tonnage += (s.weight || 0) * (s.reps || 0);
      });
    });
  });

  const dates = workouts
    .map((w) => new Date(w.date).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  const uniqueDates = [...new Set(dates)];

  let finalStreak = 0;
  let checkDate = new Date().setHours(0, 0, 0, 0);

  if (uniqueDates.length > 0) {
    if (
      uniqueDates[0] === checkDate ||
      uniqueDates[0] === checkDate - 86400000
    ) {
      finalStreak = 1;
      let nextExpected = uniqueDates[0] - 86400000;
      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === nextExpected) {
          finalStreak++;
          nextExpected -= 86400000;
        } else {
          break;
        }
      }
    }
  }

  return { tonnage, streak: finalStreak, total: workouts.length };
}

interface WorkoutViewProps {
  onAnalyzeWorkout: (workout: Workout) => void;
}

export function WorkoutView({ onAnalyzeWorkout }: WorkoutViewProps) {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>(
    "sanguis_workouts",
    [],
  );
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const [customExercises, setCustomExercises] = useLocalStorage<Exercise[]>(
    "sanguis_custom_exercises",
    [],
  );

  const createWorkout = () => {
    const newWorkout: Workout = {
      id: uuidv4(),
      title: "Новая тренировка",
      date: new Date().toISOString(),
      exercises: [],
      completed: false,
    };
    setEditingWorkout(newWorkout);
  };

  const saveWorkout = (w: Workout) => {
    const isNew = !workouts.find((wrkt) => wrkt.id === w.id);
    if (isNew) {
      setWorkouts([w, ...workouts]);
    } else {
      setWorkouts(workouts.map((wrkt) => (wrkt.id === w.id ? w : wrkt)));
    }
    setEditingWorkout(null);
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  if (editingWorkout) {
    return (
      <WorkoutEditor
        workout={editingWorkout}
        onSave={saveWorkout}
        onCancel={() => setEditingWorkout(null)}
        customExercises={customExercises}
        setCustomExercises={setCustomExercises}
      />
    );
  }

  const { tonnage, streak, total } = calculateStats(workouts);

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 md:px-12 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10 border-b border-white/[0.05] pb-8">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl lg:text-6xl text-white tracking-tight"
          >
            Дневник тренировок
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-zinc-400 italic mt-4 text-xl"
          >
            Отслеживайте свои тренировки и следите за прогрессом.
          </motion.p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={createWorkout}
          className="flex flex-shrink-0 items-center justify-center w-full md:w-auto gap-3 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-shadow uppercase tracking-wider text-sm font-bold shadow-[0_8px_24px_rgba(147,51,234,0.4)] backdrop-blur-md"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Новая запись</span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12"
      >
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 text-orange-400">
            <Flame className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Серия
            </span>
          </div>
          <p className="font-mono text-4xl text-white">
            {streak}{" "}
            <span className="text-base font-sans text-zinc-500">дн.</span>
          </p>
        </div>
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 text-blue-400">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Тоннаж
            </span>
          </div>
          <p className="font-mono text-4xl text-white">
            {tonnage}{" "}
            <span className="text-base font-sans text-zinc-500">кг</span>
          </p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 text-purple-400">
            <Activity className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              Всего записей
            </span>
          </div>
          <p className="font-mono text-4xl text-white">{total}</p>
        </div>
      </motion.div>

      <WorkoutPlannerHeatmap 
        workouts={workouts} 
        onWorkoutsChange={setWorkouts}
        onEditWorkout={setEditingWorkout}
      />

      <FitnessTrendsChart workouts={workouts} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workouts.map((workout, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={workout.id}
            className="group relative bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] hover:border-purple-500/40 hover:bg-white/[0.05] rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="h-56 bg-black/50 relative overflow-hidden">
              {workout.avatarUrl ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  src={workout.avatarUrl}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a0b2e] to-black">
                  <Dumbbell className="w-20 h-20 text-purple-900/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0511] via-[#0a0511]/50 to-transparent opacity-90" />
              <div className="absolute bottom-5 left-6">
                <span className="bg-black/50 backdrop-blur-xl text-white text-xs px-4 py-2 rounded-full uppercase tracking-widest font-semibold border border-white/10">
                  {format(new Date(workout.date), "dd MMM yyyy")}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col relative z-10">
              <h3 className="font-display text-3xl text-white mb-3 truncate drop-shadow-md">
                {workout.title}
              </h3>
              <p className="text-zinc-400 text-sm mb-8 font-sans line-clamp-2 leading-relaxed">
                Упражнений:{" "}
                <span className="text-purple-400 font-semibold">
                  {workout.exercises.length}
                </span>{" "}
                <br />
                {workout.exercises.map((e) => e.exercise.name).join(" • ")}
              </p>

              <div className="mt-auto pt-6 flex gap-3 border-t border-white/[0.05]">
                <button
                  onClick={() => setEditingWorkout(workout)}
                  className="flex-1 py-3 text-center text-xs uppercase tracking-widest text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors font-bold"
                >
                  Изменить
                </button>
                <button
                  onClick={() => onAnalyzeWorkout(workout)}
                  className="flex-1 py-3 text-center text-xs uppercase tracking-widest text-white hover:text-white bg-purple-600/90 hover:bg-purple-500 rounded-full transition-colors font-bold shadow-[0_4px_16px_rgba(147,51,234,0.4)]"
                >
                  ИИ Итог
                </button>
                <button
                  onClick={() => deleteWorkout(workout.id)}
                  className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {workouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center text-zinc-500 font-serif italic border border-dashed border-white/10 bg-white/[0.01] rounded-[2.5rem] text-lg"
          >
            Записей нет. Добавьте свою первую тренировку.
          </motion.div>
        )}
      </div>
    </div>
  );
}

function WorkoutEditor({
  workout,
  onSave,
  onCancel,
  customExercises,
  setCustomExercises,
}: {
  workout: Workout;
  onSave: (w: Workout) => void;
  onCancel: () => void;
  customExercises: Exercise[];
  setCustomExercises: (e: Exercise[]) => void;
}) {
  const [draft, setDraft] = useState<Workout>({ ...workout });
  const [showExPicker, setShowExPicker] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExAvatarId, setNewExAvatarId] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allExercises = [...defaultExercises, ...customExercises];

  const handleCreateExercise = () => {
    if (!newExName.trim()) return;
    const newEx: Exercise = {
      id: `custom-${uuidv4()}`,
      name: newExName.trim(),
      type: "strength",
      avatarId: newExAvatarId,
    };
    setCustomExercises([...customExercises, newEx]);
    setNewExName("");
    setNewExAvatarId("general");
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.6); // compress jpeg format
        setDraft({ ...draft, avatarUrl: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addExercise = (ex: Exercise) => {
    setDraft({
      ...draft,
      exercises: [...draft.exercises, { id: uuidv4(), exercise: ex, sets: [] }],
    });
    setShowExPicker(false);
  };

  const addSet = (workoutExId: string) => {
    setDraft({
      ...draft,
      exercises: draft.exercises.map((e) => {
        if (e.id === workoutExId) {
          return {
            ...e,
            sets: [...e.sets, { id: uuidv4(), reps: 0, weight: 0 }],
          };
        }
        return e;
      }),
    });
  };

  const updateSet = (
    workoutExId: string,
    setId: string,
    field: "reps" | "weight" | "incline" | "speed" | "time",
    value: number,
  ) => {
    setDraft({
      ...draft,
      exercises: draft.exercises.map((e) => {
        if (e.id === workoutExId) {
          return {
            ...e,
            sets: e.sets.map((s) =>
              s.id === setId ? { ...s, [field]: value } : s,
            ),
          };
        }
        return e;
      }),
    });
  };

  const removeSet = (workoutExId: string, setId: string) => {
    setDraft({
      ...draft,
      exercises: draft.exercises.map((e) => {
        if (e.id === workoutExId) {
          return {
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          };
        }
        return e;
      }),
    });
  };

  const removeExercise = (workoutExId: string) => {
    setDraft({
      ...draft,
      exercises: draft.exercises.filter((e) => e.id !== workoutExId),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto py-12 px-6 md:px-10 pb-48"
    >
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-10 transition uppercase tracking-widest text-sm font-semibold py-2"
      >
        <ChevronLeft className="w-5 h-5" /> Назад
      </button>

      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-8 rounded-[2.5rem] shadow-[0_12px_48px_rgba(0,0,0,0.3)] flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="bg-transparent font-display text-5xl text-white border-b border-white/[0.1] focus:border-purple-500 focus:outline-none py-3 transition-colors placeholder:text-zinc-600"
              placeholder="Название тренировки"
            />
            <div className="flex flex-wrap gap-5">
              <div className="bg-black/40 rounded-[1.25rem] p-1.5 border border-white/[0.05]">
                <input
                  type="date"
                  value={draft.date.substring(0, 10)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="bg-transparent text-white font-sans px-5 py-3 focus:outline-none text-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleCoverUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[1.25rem] transition-colors text-sm font-semibold"
              >
                <ImageIcon className="w-5 h-5" />
                Загрузить обложку (Галерея)
              </button>
            </div>
          </div>

          {draft.avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full md:w-72 h-48 md:h-64 rounded-[2rem] border border-white/[0.1] overflow-hidden shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative group"
            >
              <img
                src={draft.avatarUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDraft({ ...draft, avatarUrl: undefined })}
                className="absolute top-3 right-3 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all font-semibold"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end mb-8 px-2">
        <h3 className="font-display text-3xl text-white">Упражнения</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExPicker(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40 text-sm uppercase tracking-widest transition font-semibold"
        >
          <PlusCircle className="w-5 h-5" /> Добавить
        </motion.button>
      </div>

      <AnimatePresence>
        {showExPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] p-4 sm:p-8 mb-10 shadow-lg flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {allExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="p-4 sm:p-5 flex flex-row items-center gap-3 sm:gap-4 text-left border border-white/[0.05] hover:border-purple-500/50 bg-black/40 hover:bg-purple-900/30 rounded-[1.25rem] transition-colors text-zinc-300 text-sm sm:text-base font-medium shadow-inner min-w-0"
                  >
                    <ExerciseAvatar avatarId={ex.avatarId} className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0" />
                    <span className="line-clamp-2 leading-snug break-words sm:break-normal">{ex.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t border-white/[0.05]">
                <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Выберите аватар</div>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {EXERCISE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setNewExAvatarId(av.id)}
                      className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all shrink-0 ${newExAvatarId === av.id ? 'bg-white/10 ring-1 ring-purple-500' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                    >
                      <ExerciseAvatar avatarId={av.id} className="w-12 h-12" />
                      <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-wide">{av.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col xl:flex-row gap-4">
                  <input
                    type="text"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="flex-1 min-w-0 w-full bg-black/40 border border-white/[0.05] rounded-[1.2rem] px-5 py-4 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                    placeholder="Название нового упражнения"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateExercise}
                      disabled={!newExName.trim()}
                      className="flex-1 px-4 py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white rounded-[1.2rem] transition-colors text-xs font-semibold uppercase tracking-widest text-center"
                    >
                      В базу
                    </button>
                    <button
                      onClick={() => setShowExPicker(false)}
                      className="flex-1 px-4 py-4 border border-white/[0.05] hover:border-zinc-500 hover:bg-white/5 rounded-[1.2rem] transition-colors text-zinc-400 text-xs font-semibold uppercase tracking-widest text-center"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8">
        <AnimatePresence>
          {draft.exercises.map((workoutEx, idx) => (
            <motion.div
              key={workoutEx.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="p-6 md:p-8 border-b border-white/[0.05] flex justify-between items-center bg-black/50 text-white gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <ExerciseAvatar avatarId={workoutEx.exercise.avatarId} className="w-9 h-9 sm:w-12 sm:h-12 flex" />
                  <h4 className="font-sans font-medium text-base sm:text-lg md:text-xl line-clamp-2 leading-snug">
                    {idx + 1}. {workoutEx.exercise.name}
                  </h4>
                </div>
                <button
                  onClick={() => removeExercise(workoutEx.id)}
                  className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 flex flex-col gap-4">
                <AnimatePresence>
                  {workoutEx.sets.map((set, sIdx) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 sm:gap-4 text-zinc-300 font-sans bg-black/20 p-2 sm:p-3 pb-3 sm:pb-3 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white/[0.03] w-full"
                    >
                      <div className="w-8 sm:w-12 flex items-center justify-center shrink-0">
                        <span className="font-mono text-sm sm:text-base text-purple-400 font-bold">
                          #{sIdx + 1}
                        </span>
                      </div>
                      {workoutEx.exercise.type === "cardio" ? (
                        <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                          <div className="flex flex-col items-center justify-center bg-black/40 rounded-[1rem] px-1 py-1.5 border border-white/[0.03] focus-within:border-purple-500/50 transition-colors shadow-inner min-w-0">
                             <span className="text-zinc-500 text-[10px] uppercase font-bold sm:hidden tracking-wider text-center">Накл.</span>
                             <input type="number" value={set.incline || ""} onChange={(e) => updateSet(workoutEx.id, set.id, "incline", parseFloat(e.target.value))} className="w-full bg-transparent focus:outline-none text-center text-white text-base sm:text-lg placeholder:text-zinc-700 mt-0.5" placeholder="0" />
                          </div>
                          <div className="flex flex-col items-center justify-center bg-black/40 rounded-[1rem] px-1 py-1.5 border border-white/[0.03] focus-within:border-purple-500/50 transition-colors shadow-inner min-w-0">
                             <span className="text-zinc-500 text-[10px] uppercase font-bold sm:hidden tracking-wider text-center">Км/ч</span>
                             <input type="number" value={set.speed || ""} onChange={(e) => updateSet(workoutEx.id, set.id, "speed", parseFloat(e.target.value))} className="w-full bg-transparent focus:outline-none text-center text-white text-base sm:text-lg placeholder:text-zinc-700 mt-0.5" placeholder="0" />
                          </div>
                          <div className="flex flex-col items-center justify-center bg-black/40 rounded-[1rem] px-1 py-1.5 border border-white/[0.03] focus-within:border-purple-500/50 transition-colors shadow-inner min-w-0">
                             <span className="text-zinc-500 text-[10px] uppercase font-bold sm:hidden tracking-wider text-center">Мин.</span>
                             <input type="number" value={set.time || ""} onChange={(e) => updateSet(workoutEx.id, set.id, "time", parseInt(e.target.value))} className="w-full bg-transparent focus:outline-none text-center text-white text-base sm:text-lg placeholder:text-zinc-700 mt-0.5" placeholder="0" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-2 items-center min-w-0">
                          <div className="flex-1 flex items-center justify-center bg-black/40 rounded-[1rem] px-2 sm:px-3 py-2 border border-white/[0.03] focus-within:border-purple-500/50 transition-colors shadow-inner min-w-0">
                             <input type="number" value={set.weight || ""} onChange={(e) => updateSet(workoutEx.id, set.id, "weight", parseFloat(e.target.value))} className="w-full bg-transparent focus:outline-none text-right text-white text-base sm:text-lg min-w-[20px]" placeholder="0" />
                             <span className="text-zinc-500 text-[10px] sm:text-sm font-bold ml-1 shrink-0">кг</span>
                          </div>
                          <span className="text-zinc-600 font-extrabold text-sm shrink-0">✕</span>
                          <div className="flex-1 flex items-center justify-center bg-black/40 rounded-[1rem] px-2 sm:px-3 py-2 border border-white/[0.03] focus-within:border-purple-500/50 transition-colors shadow-inner min-w-0">
                             <input type="number" value={set.reps || ""} onChange={(e) => updateSet(workoutEx.id, set.id, "reps", parseInt(e.target.value))} className="w-full bg-transparent focus:outline-none text-right text-white text-base sm:text-lg min-w-[20px]" placeholder="0" />
                             <span className="text-zinc-500 text-[10px] sm:text-sm font-bold ml-1 shrink-0">раз</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeSet(workoutEx.id, set.id)}
                        className="text-zinc-500 hover:text-red-400 p-2 sm:p-3 hover:bg-white/5 rounded-full transition-colors shrink-0 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 ml-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addSet(workoutEx.id)}
                  className="w-full py-5 mt-3 bg-black/30 border border-white/[0.05] hover:border-purple-500/40 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-base font-bold rounded-[1.5rem] flex justify-center items-center gap-3"
                >
                  <PlusCircle className="w-6 h-6" /> Добавить подход
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 mb-[calc(2rem+env(safe-area-inset-bottom))] p-4 flex justify-center z-10 md:pl-72 w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSave(draft)}
          className="w-full sm:w-auto px-6 sm:px-16 py-4 sm:py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] transition-colors uppercase tracking-widest text-sm sm:text-base font-bold shadow-[0_8px_32px_rgba(147,51,234,0.3)] border border-purple-400/20 whitespace-normal text-center min-h-[60px]"
        >
          Сохранить тренировку
        </motion.button>
      </div>
    </motion.div>
  );
}
