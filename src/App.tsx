import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkoutView } from './components/WorkoutView';
import { InBodyView } from './components/InBodyView';
import { GoalsView } from './components/GoalsView';
import { AISummaryModal } from './components/AISummaryModal';
import { Workout } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [analyzingWorkout, setAnalyzingWorkout] = useState<Workout | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <WorkoutView onAnalyzeWorkout={setAnalyzingWorkout} />;
      case 'inbody':
        return <InBodyView />;
      case 'goals':
        return <GoalsView />;
      default:
        return <WorkoutView onAnalyzeWorkout={setAnalyzingWorkout} />;
    }
  };

  return (
    <div className="relative h-screen h-[100dvh] bg-black flex flex-col md:flex-row font-sans selection:bg-purple-600/30 selection:text-purple-100 overflow-hidden">
      {/* iOS Ambient Spatial Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-700/10 blur-[100px] rounded-full pointer-events-none" />
      
      <Sidebar 
        currentTab={currentTab} 
        setTab={setCurrentTab} 
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Top Header with Glow Logo */}
      <div className="md:hidden flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-2xl z-30 relative animate-fade-in">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <img 
              src="https://i.ibb.co/rGsQ3yZp/logo-Photoroom.png" 
              alt="Sanguis Logo" 
              className="w-[3.5rem] h-[3.5rem] object-contain shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-purple-300 font-display font-medium text-xl tracking-wide select-none">S</span>
          )}
          <h1 className="font-display text-lg tracking-[0.2em] uppercase text-white font-medium">Sanguis</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
        </button>
      </div>
      
      <main className="flex-1 h-full md:h-screen overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, scale: 0.97, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(5px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="min-h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {analyzingWorkout && (
          <AISummaryModal 
            workout={analyzingWorkout} 
            onClose={() => setAnalyzingWorkout(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
