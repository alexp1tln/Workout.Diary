import React, { useState } from "react";
import { Workout } from "../types";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { startOfWeek, endOfWeek, subWeeks, format, isWithinInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { Flame, Activity, Sparkles, TrendingUp } from "lucide-react";

interface FitnessTrendsChartProps {
  workouts: Workout[];
}

export function FitnessTrendsChart({ workouts }: FitnessTrendsChartProps) {
  const [weeksToDisplay, setWeeksToDisplay] = useState<number>(6);

  // Helper inside chart logic to calculate weekly metrics
  const generateWeeklyData = (workoutsList: Workout[], weeksCount: number) => {
    const data = [];
    const today = new Date();

    for (let i = weeksCount - 1; i >= 0; i--) {
      const targetDate = subWeeks(today, i);
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });

      // Filter workouts in this interval
      const workoutsInWeek = workoutsList.filter((w) => {
        const wDate = new Date(w.date);
        return isWithinInterval(wDate, { start, end });
      });

      let totalCalories = 0;
      let totalIntensity = 0;

      workoutsInWeek.forEach((w) => {
        let calories = 0;
        let intensity = 0;
        w.exercises.forEach((we) => {
          const isCardio = we.exercise.type === "cardio";
          const numSets = we.sets.length;

          if (isCardio) {
            we.sets.forEach((set) => {
              const time = set.time || 0;
              const speed = set.speed || 0;
              if (time > 0) {
                calories += speed > 0 ? time * speed * 0.95 : time * 7.5;
              } else {
                calories += 80;
              }
              intensity += (time * 8) + (speed * 12) + 20;
            });
            if (numSets === 0) {
              calories += 100;
              intensity += 50;
            }
          } else {
            we.sets.forEach((set) => {
              const reps = set.reps || 0;
              const weight = set.weight || 0;
              calories += reps * (weight * 0.035 + 0.15) + 8;
              intensity += (weight * reps * 0.08) + (reps * 1.5) + 10;
            });
            if (numSets === 0) {
              calories += 30;
              intensity += 30;
            }
          }
        });
        totalCalories += Math.round(calories);
        totalIntensity += Math.round(intensity);
      });

      const weekLabel = `${format(start, "d MMM", { locale: ru })} - ${format(end, "d MMM", { locale: ru })}`;

      data.push({
        name: weekLabel,
        calories: totalCalories,
        intensity: totalIntensity,
        workoutsCount: workoutsInWeek.length,
      });
    }

    return data;
  };

  const chartData = generateWeeklyData(workouts, weeksToDisplay);
  const totalCaloriesAll = chartData.reduce((sum, d) => sum + d.calories, 0);
  const maxWeeklyCalories = Math.max(...chartData.map((d) => d.calories), 1);
  const hasWorkouts = workouts.length > 0;

  // Custom tooltips logic compatible with Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
          <p className="text-zinc-400 text-xs font-semibold tracking-wider uppercase mb-2">
            {label}
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <p className="text-zinc-300 text-sm font-medium">
                Калории: <span className="text-white font-mono font-bold">{payload[0].value} ккал</span>
              </p>
            </div>
            {payload[1] && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
                <p className="text-zinc-300 text-sm font-medium">
                  Интенсивность: <span className="text-white font-mono font-bold">{payload[1].value}</span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 border-t border-white/5 pt-2 mt-1">
              <p className="text-zinc-500 text-xs">
                Тренировок: <span className="text-zinc-300 font-mono">{payload[0].payload.workoutsCount}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="fitness-trends-panel" className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[2.5rem] p-6 sm:p-8 mb-12 shadow-[0_12px_45px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-300 hover:border-purple-500/20">
      {/* Light glow decoration matching app design */}
      <div className="absolute -top-[10%] -right-[15%] w-[45%] h-[40%] bg-purple-600/5 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[35%] h-[35%] bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 text-purple-400 mb-1">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#d8b4fe]">Статистика Трендов</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-white tracking-tight">Экспедиция Нагрузки</h3>
        </div>

        {/* Weeks Selector Buttons */}
        <div className="bg-white/5 border border-white/[0.05] p-1 rounded-2xl flex gap-1">
          {[4, 6, 8, 12].map((weeks) => (
            <button
              key={weeks}
              onClick={() => setWeeksToDisplay(weeks)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                weeksToDisplay === weeks
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {weeks} нед
            </button>
          ))}
        </div>
      </div>

      {!hasWorkouts ? (
        <div className="h-[300px] flex flex-col items-center justify-center p-8 border border-dashed border-white/10 bg-black/20 rounded-[2rem] text-center">
          <TrendingUp className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400 text-lg font-medium font-serif italic mb-2">Прогресс пуст</p>
          <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
            Добавьте свою первую тренировку, чтобы дек декодировать и запустить расчет расхода калорий и интенсивности за прошедшие недели.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Visual Recharts View */}
          <div className="lg:col-span-3 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: -5, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(255, 255, 255, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#f43f5e"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  unit=""
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#c084fc"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  formatter={(value) => {
                    const labelStr = value === "calories" ? "Калории" : "Интенсивность";
                    return <span className="text-xs font-semibold text-zinc-300 ml-1">{labelStr}</span>;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="calories"
                  fill="url(#gradientCalories)"
                  stroke="#f43f5e"
                  strokeWidth={1.5}
                  barSize={40}
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="intensity"
                  stroke="url(#lineGlow)"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#a855f7", strokeWidth: 2, fill: "#000" }}
                  activeDot={{ r: 6, stroke: "#c084fc", strokeWidth: 2, fill: "#fff" }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Sidebar Panel with summary metrics */}
          <div className="flex flex-col justify-center gap-5 lg:pl-4 lg:border-l lg:border-white/[0.05]">
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-rose-400">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Всего сожжено</span>
              </div>
              <p className="font-mono text-3xl font-semibold text-white">
                {totalCaloriesAll} <span className="text-sm font-sans text-zinc-500">ккал</span>
              </p>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-rose-500 h-full rounded-full" 
                  style={{ width: `${Math.min((totalCaloriesAll / 12000) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">Норма расхода сжигания (12к ккал)</span>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Activity className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Интенсивность тренировок</span>
              </div>
              <p className="font-mono text-3xl font-semibold text-white">
                {Math.round(chartData.reduce((sum, d) => sum + d.intensity, 0) / Math.max(chartData.filter(d => d.workoutsCount > 0).length, 1))}
                <span className="text-sm font-sans text-zinc-500"> ср.</span>
              </p>
              <span className="text-[10px] text-zinc-500">Расчитано на основе сетов, весов и объема</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
