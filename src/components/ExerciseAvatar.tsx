import React from 'react';
import { 
  BicepsFlexed, 
  Dumbbell, 
  Layers,
  Footprints, 
  Flame, 
  LayoutGrid, 
  Activity, 
  Anvil, 
  Zap 
} from 'lucide-react';

export const EXERCISE_AVATARS = [
  { id: 'arms', name: 'Руки', icon: BicepsFlexed, color: 'text-blue-400' },
  { id: 'chest', name: 'Грудь', icon: Dumbbell, color: 'text-red-400' },
  { id: 'back', name: 'Спина', icon: Layers, color: 'text-emerald-400' },
  { id: 'legs', name: 'Ноги', icon: Footprints, color: 'text-amber-400' },
  { id: 'glutes', name: 'Ягодицы', icon: Flame, color: 'text-pink-400' },
  { id: 'core', name: 'Пресс', icon: LayoutGrid, color: 'text-indigo-400' },
  { id: 'cardio', name: 'Кардио', icon: Activity, color: 'text-fuchsia-400' },
  { id: 'weights', name: 'База', icon: Anvil, color: 'text-violet-400' },
  { id: 'general', name: 'Универсально', icon: Zap, color: 'text-zinc-400' }
];

export function ExerciseAvatar({ avatarId, className = "w-10 h-10" }: { avatarId?: string, className?: string }) {
  const avatar = EXERCISE_AVATARS.find(a => a.id === avatarId) || EXERCISE_AVATARS.find(a => a.id === 'general')!;
  const Icon = avatar.icon;
  
  return (
    <div className={`rounded-full flex items-center justify-center shrink-0 bg-black shadow-inner border border-white/[0.1] ${className}`}>
      <Icon className={`w-1/2 h-1/2 ${avatar.color} drop-shadow-md`} />
    </div>
  );
}
