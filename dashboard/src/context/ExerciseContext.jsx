import React, { createContext, useState } from 'react';
import { Package } from 'lucide-react';

const generateExercises = (count) => {
  const names = [
    'Supine Pelvic Clocks', 'Thoracic Extension', 'Long-Lever Hamstring Bridge',
    'Dead Bug', 'Bird Dog', 'McGill Curl-Up', 'B-Stance Glute Bridge',
    'Romanian Deadlift', 'Bulgarian Split Squat', 'Front Rack Carry'
  ];
  const phasesArr = [['Reset'], ['Reset', 'Control'], ['Control', 'Integrate'], ['Integrate']];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `EX-26${(i + 1).toString().padStart(4, '0')}`,
    name: names[i % names.length],
    bodyAreas: ['Lower Back', 'Shoulder', 'Upper Back', 'Middle Back', 'Neck'].slice(0, 1 + (i % 5)),
    phases: phasesArr[i % phasesArr.length],
    equipment: <Package size={18} className="text-[#34D399]" />,
    status: i % 3 === 0 ? 'Drafted' : 'Published'
  }));
};

export const ExerciseContext = createContext();

export const ExerciseProvider = ({ children }) => {
  const [exercises, setExercises] = useState(generateExercises(24));

  const addExercise = (newExercise) => {
    setExercises([
      {
        id: `EX-26${(exercises.length + 1).toString().padStart(4, '0')}`,
        ...newExercise,
        status: 'Published'
      },
      ...exercises
    ]);
  };

  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  return (
    <ExerciseContext.Provider value={{ exercises, addExercise, deleteExercise }}>
      {children}
    </ExerciseContext.Provider>
  );
};
