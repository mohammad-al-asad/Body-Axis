export const EQUIPMENT_OPTIONS = [
  "Yoga Mat",
  "Resistance Band",
  "Dumbbell",
  "Foam Roller",
  "Lacrosse Ball",
  "Yoga Block",
  "Bench",
  "Mini Band",
];

export const PHASE_OPTIONS = ["reset", "control", "integrate"];

export const TARGET_AREA_OPTIONS = [
  "SHOULDER",
  "CORE",
  "OUTER HIP",
  "FRONT HIP",
  "FOOT/ANKLE",
  "NECK/UPPER BACK",
  "MIDDLE BACK",
  "LOWER BACK",
  "GLUTES",
  "BACK HIP",
  "HAMSTRING",
  "CALF",
];

export const USE_CASE_OPTIONS = [
  "Move More Freely",
  "Ease Everyday Soreness",
  "Build Strength & Control",
  "Improve Performance",
];

export const USE_CASE_LABEL_MAP = {
  "Stiff or Tight": "Move More Freely",
  "Aches or Discomfort": "Ease Everyday Soreness",
  "Feels Weak or Unstable": "Build Strength & Control",
  "Just Want to Move Better": "Improve Performance",
};

export const TARGET_AREA_LABEL_MAP = {
  "SIDE LOWER BACK": "LOWER BACK",
};

export const normalizeUseCaseLabel = (value) =>
  USE_CASE_LABEL_MAP[value] || value;

export const normalizeTargetAreaLabel = (value) =>
  TARGET_AREA_LABEL_MAP[value] || value;
