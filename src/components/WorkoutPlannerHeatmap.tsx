import React, { useState } from "react";
import { Workout } from "../types";
import {
  format,
  subWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isFuture,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { 
  CalendarDays, 
  Flame, 
  Grid3X3, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  Sparkles,
  CheckCircle2,
  Hourglass,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from "uuid";

interface WorkoutPlannerHeatmapProps {
  workouts: Workout[];
  onWorkoutsChange: (newWorkouts: Workout[]) => void;
  onEditWorkout: (workout: Workout) => void;
}

export function WorkoutPlannerHeatmap({ 
  workouts, 
  onWorkoutsChange,
  onEditWorkout
}: WorkoutPlannerHeatmapProps) {
  // Navigation states
  const [viewMode, setViewMode] = useState<"heatmap" | "calendar">("heatmap");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<{
    date: Date;
    items: Workout[];
  } | null>(null);

  // Calculate day details (intensity, tonnage, workouts)
  const getDayStats = (date: Date) => {
    const list = workouts.filter((w) => isSameDay(new Date(w.date), date));
    let tonnage = 0;
    let setsCount = 0;
    let completedCount = 0;

    list.forEach((w) => {
      if (w.completed) completedCount++;
      w.exercises.forEach((we) => {
        we.sets.forEach((s) => {
          tonnage += (s.weight || 0) * (s.reps || 0);
          setsCount++;
        });
      });
    });

    // Score intensity
    let intensityScore = 0;
    if (list.length > 0) {
      intensityScore = Math.min(10, Math.floor(tonnage / 1000) + list.length * 2 + setsCount * 0.5);
      if (intensityScore === 0) intensityScore = 2; // Light activity placeholder
    }

    return {
      workouts: list,
      tonnage,
      setsCount,
      completedCount,
      intensity: intensityScore,
    };
  };

  // Generate lists of days for Heatmap (last 20 weeks)
  const WEEKS_COUNT = 20;
  const generateHeatmapDays = () => {
    const days: Date[] = [];
    const today = new Date();
    // Monday of 20 weeks ago
    const start = startOfWeek(subWeeks(today, WEEKS_COUNT - 1), { weekStartsOn: 1 });
    
    // We render up to end of this week
    for (let i = 0; i < WEEKS_COUNT * 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  // Create grid arrays divided by day-of-week for vertical columns representation like GitHub
  const dayRows = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const getDayLabel = (dayIndex: number) => {
    const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    return labels[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  // Monthly Calendar creation helper
  const getMonthDaysGrid = () => {
    const startOfCurrent = startOfMonth(currentMonth);
    const endOfCurrent = endOfMonth(currentMonth);
    
    // Adjust start offset to Monday
    const startOfGrid = startOfWeek(startOfCurrent, { weekStartsOn: 1 });
    
    const days: Date[] = [];
    let current = startOfGrid;
    
    // We render 6 full weeks (42 days) to guarantee coverage of any month offset
    for (let i = 0; i < 42; i++) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  };

  const monthDays = getMonthDaysGrid();

  // Color mapper based on workout intensity
  const getIntensityClass = (intensity: number) => {
    if (intensity === 0) return "bg-white/[0.03] border-white/[0.02] hover:bg-white/10";
    if (intensity <= 2) return "bg-purple-950/40 text-purple-200 hover:bg-purple-900/40 border-purple-900/20 shadow-[0_0_8px_rgba(168,85,247,0.05)]";
    if (intensity <= 5) return "bg-purple-800/50 text-purple-100 hover:bg-purple-700/50 border-purple-600/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]";
    if (intensity <= 8) return "bg-purple-600/70 text-white hover:bg-purple-500/70 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.30)]";
    return "bg-purple-500 text-white hover:bg-purple-400 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse";
  };

  // Add planned workout handler
  const handleQuickPlan = (date: Date) => {
    const newWorkout: Workout = {
      id: uuidv4(),
      title: isFuture(date) ? "Запланированная тренировка" : "Запись тренировки",
      date: date.toISOString(),
      exercises: [],
      completed: false
    };
    
    const updatedWorkouts = [newWorkout, ...workouts];
    onWorkoutsChange(updatedWorkouts);
    onEditWorkout(newWorkout);
  };

  const handleTileClick = (date: Date, stats: ReturnType<typeof getDayStats>) => {
    setSelectedDayWorkouts({
      date,
      items: stats.workouts
    });
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2.5rem] p-6 sm:p-8 mb-12 shadow-[0_12px_45px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300 hover:border-purple-500/10">
      <div className="absolute -top-[20%] -left-[10%] w-[40%] h-[40%] bg-purple-900/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-rose-950/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/[0.05]">
        <div>
          <div className="flex items-center gap-3 text-purple-400 mb-1">
            <CalendarDays className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-300">Календарь-Планировщик</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
            Тепловая карта активности
          </h3>
        </div>

        {/* View Mode & Calendar Nav combo */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Dual Toggle Heatmap / Month Grid */}
          <div className="bg-white/5 border border-white/[0.05] p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setViewMode("heatmap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                viewMode === "heatmap"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Теплокарта</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                viewMode === "calendar"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Календарь</span>
            </button>
          </div>

          {/* Month Steppers (Visible when calendar view is selected) */}
          {viewMode === "calendar" && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/[0.05] p-1 rounded-2xl">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-white px-2 uppercase tracking-wider">
                {format(currentMonth, "LLLL yyyy", { locale: ru })}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid View Area */}
      {viewMode === "heatmap" ? (
        <div className="flex flex-col gap-4 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
          {/* Heatmap Grid Wrapper */}
          <div className="flex flex-row gap-2 min-w-[720px] pb-2">
            {/* Days list labels */}
            <div className="grid grid-rows-7 gap-[5px] text-right pr-2 select-none pt-4">
              {dayRows.map((dr, index) => (
                <span 
                  key={dr} 
                  className={`text-[10px] font-mono leading-none h-[14px] flex items-center justify-end font-semibold ${
                    index % 2 === 0 ? "text-zinc-600" : "text-zinc-500"
                  }`}
                >
                  {getDayLabel(dr)}
                </span>
              ))}
            </div>

            {/* Render weeks cols dynamically */}
            <div className="flex-1 flex flex-row gap-[5px]">
              {Array.from({ length: WEEKS_COUNT }).map((_, weekIdx) => {
                const weekStartIndex = weekIdx * 7;
                return (
                  <div key={weekIdx} className="grid grid-rows-7 gap-[5px] flex-1">
                    {/* Render week labels at the very top of each column on the first day of that week */}
                    {dayRows.map((dayRowIndex) => {
                      // Lookup absolute day index in original array
                      // Map dayRowIndex back to matches in weekDays list
                      const absoluteDay = heatmapDays.find((d, idx) => {
                        const calculatedIndexInGrid = weekStartIndex + (d.getDay() === 0 ? 6 : d.getDay() - 1);
                        return idx === calculatedIndexInGrid;
                      });

                      if (!absoluteDay) {
                        return <div key={dayRowIndex} className="w-[14px] h-[14px] bg-transparent" />;
                      }

                      const stats = getDayStats(absoluteDay);
                      const isDayToday = isToday(absoluteDay);

                      return (
                        <div key={dayRowIndex} className="relative group/tile">
                          <button
                            onClick={() => handleTileClick(absoluteDay, stats)}
                            className={`w-[14px] h-[14px] rounded-sm border transition-all duration-300 ${getIntensityClass(
                              stats.intensity
                            )} ${
                              isDayToday 
                                ? "ring-1 ring-purple-400 ring-offset-1 ring-offset-black" 
                                : ""
                            }`}
                          />

                          {/* Hover Rich Tooltip styled according to Gothic palette */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl border border-white/10 text-white rounded-xl shadow-2xl p-3 z-50 pointer-events-none opacity-0 group-hover/tile:opacity-100 transition-all duration-200 delay-100 w-48 flex flex-col gap-1.5 transform scale-90 group-hover/tile:scale-100">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                              <span className="text-[10px] font-bold text-zinc-400">
                                {format(absoluteDay, "d MMM yyyy", { locale: ru })}
                              </span>
                              {isDayToday && (
                                <span className="bg-purple-800 text-[9px] px-1.5 rounded-full font-bold font-sans uppercase">
                                  Сегодня
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 text-[11px] font-sans">
                              <div className="flex justify-between items-center text-zinc-300">
                                <span>Тренировок:</span>
                                <span className="font-mono text-white font-bold">{stats.workouts.length}</span>
                              </div>
                              {stats.workouts.length > 0 && (
                                <>
                                  <div className="flex justify-between items-center text-zinc-300">
                                    <span>Тоннаж:</span>
                                    <span className="font-mono text-purple-400 font-bold">{stats.tonnage} кг</span>
                                  </div>
                                  <div className="flex justify-between items-center text-zinc-300">
                                    <span>Интенсивность:</span>
                                    <span className="font-mono text-rose-400 font-bold">{stats.intensity}/10</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500 italic mt-1 text-center font-serif">
                              {stats.workouts.length > 0 ? "Нажмите для просмотра" : "Нажмите для создания"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Key Guide */}
          <div className="flex items-center justify-end gap-2 text-xs text-zinc-500 select-none mr-4">
            <span>Регулярность тренировок:</span>
            <span>Меньше</span>
            <div className="flex gap-[4px] items-center">
              <div className="w-3 h-3 rounded-sm bg-white/[0.03] border border-white/[0.01]" />
              <div className="w-3 h-3 rounded-sm bg-purple-950/40 border border-purple-900/20" />
              <div className="w-3 h-3 rounded-sm bg-purple-800/50 border border-purple-600/30" />
              <div className="w-3 h-3 rounded-sm bg-purple-600/70 border border-purple-500/40" />
              <div className="w-3 h-3 rounded-sm bg-purple-500 border border-purple-400/50" />
            </div>
            <span>Больше</span>
          </div>
        </div>
      ) : (
        // Monthly Interactive Calendar Grid
        <div className="w-full">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((dayName) => (
              <div key={dayName} className="text-center font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month grid tiles */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, idx) => {
              const stats = getDayStats(day);
              const isTodayDay = isToday(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isFutureDay = isFuture(day);
              const hasItems = stats.workouts.length > 0;

              return (
                <div
                  key={idx}
                  className={`bg-zinc-950/30 border rounded-[1.25rem] p-2 min-h-[90px] flex flex-col justify-between transition-all duration-300 relative group/calendar-tile ${
                    isCurrentMonth 
                      ? "border-white/[0.04]" 
                      : "border-white/[0.01] opacity-30"
                  } ${
                    isTodayDay 
                      ? "ring-1 ring-purple-500 border-purple-500/30 bg-purple-500/[0.02]" 
                      : ""
                  } ${
                    hasItems 
                      ? "hover:border-purple-500/30 bg-purple-950/[0.05]" 
                      : "hover:border-white/10"
                  }`}
                >
                  {/* Top line within calendar date box */}
                  <div className="flex items-center justify-between">
                    <span 
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isTodayDay 
                          ? "bg-purple-600/80 text-white shadow-sm shadow-purple-500/20" 
                          : isCurrentMonth 
                            ? "text-zinc-400" 
                            : "text-zinc-600"
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Compact actions button */}
                    <button
                      onClick={() => handleQuickPlan(day)}
                      title={isFutureDay ? "Запланировать тренировку" : "Добавить тренировку"}
                      className="opacity-0 group-hover/calendar-tile:opacity-100 transition-opacity p-1 text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-lg"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date details indicators */}
                  <div className="mt-2 flex-grow flex flex-col justify-end gap-1.5">
                    {hasItems ? (
                      <button
                        onClick={() => handleTileClick(day, stats)}
                        className="text-left w-full truncate"
                      >
                        {stats.workouts.map((w, index) => (
                          <div 
                            key={w.id} 
                            className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-md truncate mb-1 ${
                              w.completed 
                                ? "bg-purple-950/40 text-purple-300 border border-purple-900/30" 
                                : "bg-zinc-900/60 text-zinc-400 border border-dashed border-white/5"
                            }`}
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-purple-400 shrink-0" />
                            {w.title}
                          </div>
                        ))}
                        {stats.tonnage > 0 && (
                          <div className="text-[9px] font-mono font-medium text-zinc-500 flex items-center gap-1 px-1 mt-0.5">
                            <Scale className="w-2.5 h-2.5" />
                            <span>{stats.tonnage} кг</span>
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Workouts Panel */}
      <AnimatePresence>
        {selectedDayWorkouts && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-6 p-6 border border-white/10 bg-black/60 backdrop-blur-2xl rounded-[2rem] flex flex-col gap-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-semibold text-white tracking-wide">
                  Детализация: {format(selectedDayWorkouts.date, "dd MMMM yyyy", { locale: ru })}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayWorkouts(null)}
                className="text-xs font-semibold text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-xl transition-all"
              >
                Закрыть
              </button>
            </div>

            {selectedDayWorkouts.items.length === 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border border-dashed border-white/5 bg-white/[0.01] rounded-2xl">
                <span className="text-xs text-zinc-400 italic">
                  В этот день не было записанных тренировок. Желаете запланировать?
                </span>
                <button
                  onClick={() => {
                    handleQuickPlan(selectedDayWorkouts.date);
                    setSelectedDayWorkouts(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Запланировать</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDayWorkouts.items.map((workout) => (
                  <div 
                    key={workout.id}
                    className="border border-white/5 bg-white/[0.01] backdrop-blur-md p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium text-white">{workout.title}</h5>
                        {workout.completed ? (
                          <span className="text-[9px] text-[#22c55e] font-sans font-bold uppercase tracking-wider bg-[#22c55e]/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#22c55e]/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Ок
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-400 font-sans font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/5">
                            <Hourglass className="w-2.5 h-2.5" />
                            План
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">
                        Упражнений: {workout.exercises.length}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        onEditWorkout(workout);
                        setSelectedDayWorkouts(null);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-purple-400 hover:text-white hover:bg-purple-600/20 border border-purple-500/10 rounded-xl transition-all"
                    >
                      Открыть
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
