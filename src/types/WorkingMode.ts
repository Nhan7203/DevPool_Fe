export const WorkingMode = {
  None: 0,
  Onsite: 1,
  Remote: 2,
  Hybrid: 4,
  Flexible: 8,
} as const;

export type WorkingMode = typeof WorkingMode[keyof typeof WorkingMode];
