import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function GoalsView() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('sanguis_profile', { goals: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState(profile.goals);

  const handleSave = () => {
    setProfile({ goals: tempGoals });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 md:px-12">
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl text-white mb-10 pb-4 border-b border-white/[0.05]"
      >
        Мои цели
      </motion.h2>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[2rem] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <p className="font-serif text-zinc-400 italic mb-8 text-lg">
          "Цель без плана — это просто желание."
        </p>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="editing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-6"
            >
              <textarea
                className="w-full h-48 bg-black/30 border border-white/[0.05] rounded-[1.5rem] p-6 text-white font-sans text-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all resize-none shadow-inner"
                placeholder="Например: Набрать сухую мышечную массу, сжечь жир до 12%, увеличить силу..."
                value={tempGoals}
                onChange={(e) => setTempGoals(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-sans rounded-full"
                >
                  Отмена
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-colors uppercase tracking-wider text-sm font-semibold shadow-[0_4px_20px_rgba(147,51,234,0.3)]"
                >
                  Сохранить
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="viewing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="min-h-[10rem] text-zinc-200 whitespace-pre-wrap font-sans text-lg leading-relaxed">
                {profile.goals || (
                  <span className="text-zinc-600 italic">Цели пока не заданы. Нажмите "Изменить", чтобы описать свои стремления. ИИ использует это для плана питания.</span>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTempGoals(profile.goals);
                    setIsEditing(true);
                  }}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/[0.05] text-white rounded-full transition-colors uppercase tracking-wider text-sm font-semibold backdrop-blur-md"
                >
                  Изменить
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
