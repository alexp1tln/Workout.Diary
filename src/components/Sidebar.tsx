import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Activity, Beaker, User, LayoutDashboard, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfExportButton } from './PdfExportButton';

interface TabListProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ currentTab, setTab, isOpenMobile, onCloseMobile }: TabListProps) {
  const [logoError, setLogoError] = useState(false);
  const tabs = [
    { id: 'dashboard', label: 'Дневник', icon: LayoutDashboard },
    { id: 'inbody', label: 'InBody', icon: Beaker },
    { id: 'goals', label: 'Цели', icon: User },
  ];

  return (
    <>
      <div className="hidden md:flex w-72 h-screen shrink-0 bg-white/[0.01] backdrop-blur-3xl border-r border-white/5 flex-col items-start py-10 z-20 relative">
        <div className="mb-12 px-8 w-full flex items-center justify-start gap-4 text-purple-400 font-medium">
          {!logoError ? (
            <img 
              src="https://i.ibb.co/rGsQ3yZp/logo-Photoroom.png" 
              alt="Sanguis Logo" 
              className="w-16 h-16 object-contain shrink-0 drop-shadow-[0_0_15px_rgba(168,85,247,0.45)]"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-purple-300 font-display font-medium text-2xl tracking-wide select-none">S</span>
          )}
          <h1 className="font-display text-2xl tracking-widest uppercase text-white font-medium">Sanguis</h1>
        </div>
        
        <nav className="w-full flex-1 flex flex-col gap-3 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "relative flex flex-row items-center justify-start gap-4 py-4 px-6 rounded-2xl transition-all duration-300 font-sans group",
                currentTab === tab.id 
                  ? "text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {currentTab === tab.id && (
                <motion.div 
                  layoutId="desktop-nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={cn("w-6 h-6 transition-transform group-active:scale-95", currentTab === tab.id ? "text-purple-400" : "")} />
              <span className="text-sm font-medium tracking-wide">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-8 w-full flex flex-col gap-6">
          <PdfExportButton />
          <p className="text-xs font-serif text-zinc-600 italic">
            "Дисциплина — это ключ к результату."
          </p>
        </div>
      </div>

      {/* Mobile Sidebar Slide-Over Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[45]"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-0 left-0 h-full w-[280px] bg-zinc-950/95 backdrop-blur-3xl border-r border-white/5 flex flex-col items-start py-8 z-[50] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {/* Drawer Header */}
              <div className="w-full px-6 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {!logoError ? (
                    <img 
                      src="https://i.ibb.co/rGsQ3yZp/logo-Photoroom.png" 
                      alt="Sanguis Logo" 
                      className="w-10 h-10 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="text-purple-300 font-display font-medium text-xl tracking-wide select-none">S</span>
                  )}
                  <span className="font-display text-lg tracking-widest uppercase text-white font-medium">Sanguis</span>
                </div>
                
                <button 
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="w-full flex-1 flex flex-col gap-2 px-3">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setTab(tab.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={cn(
                      "relative flex flex-row items-center justify-start gap-4 py-3.5 px-5 rounded-2xl transition-all duration-300 font-sans group w-full text-left",
                      currentTab === tab.id 
                        ? "text-white" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {currentTab === tab.id && (
                      <motion.div 
                        layoutId="mobile-drawer-pill"
                        className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <tab.icon className={cn("w-5 h-5 transition-transform group-active:scale-95", currentTab === tab.id ? "text-purple-400" : "text-zinc-500")} />
                    <span className="text-sm font-medium tracking-wide">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Footer */}
              <div className="mt-auto px-6 w-full flex flex-col gap-6">
                <PdfExportButton />
                <p className="text-xs font-serif text-zinc-600 italic">
                  "Дисциплина — это ключ к результату."
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
