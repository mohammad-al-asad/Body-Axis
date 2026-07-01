export const phaseOrder = ['reset', 'control', 'integrate'] as const;

export const getPhaseNumber = (phaseName: string) => {
  const normalized = phaseName.trim().toLowerCase();
  const index = phaseOrder.indexOf(normalized as (typeof phaseOrder)[number]);
  return index >= 0 ? index + 1 : null;
};
