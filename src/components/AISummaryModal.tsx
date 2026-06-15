import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Workout, UserProfile } from '../types';
import { X, Flame, Coffee, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { summarizeWorkout } from '../lib/gemini';

interface Props {
  workout: Workout;
  onClose: () => void;
}

export function AISummaryModal({ workout, onClose }: Props) {
  const [profile] = useLocalStorage<UserProfile>('sanguis_profile', { goals: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const stats = workout.exercises.map(ex => ({
          name: ex.exercise.name,
          sets: ex.sets.map(s => `${s.weight}kg x ${s.reps}`).join(', ')
        }));

        const json = await summarizeWorkout(stats, profile.goals || 'Общее развитие.');
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSummary();
  }, [workout, profile.goals]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <motion.div 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
         className="absolute inset-0 bg-[#000000]/80 backdrop-blur-3xl" 
         onClick={onClose}
       ></motion.div>
       
       <motion.div 
         initial={{ opacity: 0, y: 30, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: 20, scale: 0.95 }}
         transition={{ type: "spring", bounce: 0, duration: 0.5 }}
         className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_80px_rgba(147,51,234,0.15)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
       >
         <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/[0.05] bg-black/40">
           <h3 className="font-display text-2xl text-white flex items-center gap-3">
             <Activity className="w-6 h-6 text-purple-400" />
             Итог Тренировки
           </h3>
           <motion.button 
             whileHover={{ scale: 1.1, rotate: 90 }}
             whileTap={{ scale: 0.9 }}
             onClick={onClose} 
             className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
           >
             <X className="w-5 h-5"/>
           </motion.button>
         </div>

         <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-24 text-purple-500 space-y-6">
                 <motion.div
                   animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                 >
                   <Flame className="w-16 h-16" />
                 </motion.div>
                 <p className="font-serif italic text-zinc-400 text-lg">Анализируем результаты тренировки...</p>
               </div>
            ) : data ? (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col gap-10"
               >
                 <div className="flex items-center gap-5 bg-black/40 p-6 rounded-[1.5rem] border border-white/[0.05]">
                    <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                      <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                       <p className="text-xs font-sans uppercase tracking-widest text-zinc-500 font-semibold mb-1">Сожжено (эстимация)</p>
                       <p className="font-mono text-4xl text-white">{data.estimatedCaloriesBurned} <span className="text-sm font-sans text-zinc-500 uppercase tracking-widest">ккал</span></p>
                    </div>
                 </div>

                 <div>
                    <h4 className="font-display text-2xl text-purple-50 mb-4">Вердикт</h4>
                    <div className="text-zinc-300 font-serif leading-relaxed text-lg italic bg-black/20 p-6 rounded-[1.5rem] border border-white/[0.03] shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-500/50"></div>
                      "{data.summaryText}"
                    </div>
                 </div>

                 <div>
                    <h4 className="font-display text-xl text-zinc-200 mb-5 flex items-center gap-3">
                       <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                         <Coffee className="w-5 h-5 text-blue-400" />
                       </div>
                       Восстановление: План питания
                    </h4>
                    <div className="grid gap-4">
                      {data.nutritionPlan?.map((meal: any, i: number) => (
                        <div key={i} className="bg-black/30 border border-white/[0.05] p-5 rounded-[1.5rem] flex flex-col relative overflow-hidden group hover:bg-black/40 transition-colors">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600/30 group-hover:bg-purple-500 transition-colors"></div>
                           <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-2">{meal.mealName}</p>
                           <p className="text-zinc-300 font-sans mb-4 text-sm leading-relaxed">{meal.suggestion}</p>
                           <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full inline-block self-start border border-white/5">{meal.macros}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               </motion.div>
            ) : (
               <div className="text-center text-red-400 py-16 bg-red-500/10 rounded-[1.5rem] border border-red-500/20">
                 Ошибка при получении анализа от ИИ.
               </div>
            )}
         </div>
       </motion.div>
    </div>
  );
}
