import { Exercise } from '../types';

export const defaultExercises: Exercise[] = [
  { id: 'ex-1', name: 'Приседания со штангой', type: 'strength', avatarId: 'legs' },
  { id: 'ex-2', name: 'Становая тяга', type: 'strength', avatarId: 'weights' },
  { id: 'ex-3', name: 'Жим лежа', type: 'strength', avatarId: 'chest' },
  { id: 'ex-4', name: 'Армейский жим', type: 'strength', avatarId: 'arms' },
  { id: 'ex-5', name: 'Подтягивания', type: 'strength', avatarId: 'back' },
  { id: 'ex-6', name: 'Тяга штанги в наклоне', type: 'strength', avatarId: 'back' },
  { id: 'ex-7', name: 'Сгибания на бицепс', type: 'strength', avatarId: 'arms' },
  { id: 'ex-8', name: 'Разгибания на трицепс', type: 'strength', avatarId: 'arms' },
  { id: 'ex-9', name: 'Жим ногами', type: 'strength', avatarId: 'legs' },
  { id: 'ex-10', name: 'Подъемы на носки', type: 'strength', avatarId: 'legs' },
  { id: 'ex-c1', name: 'Бег (Эллипсоид/Дорожка)', type: 'cardio', avatarId: 'cardio' },
  { id: 'ex-c2', name: 'Велотренажер', type: 'cardio', avatarId: 'cardio' },
  { id: 'ex-c3', name: 'Степпер', type: 'cardio', avatarId: 'cardio' },
];
