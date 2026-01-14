export interface PowerplayPhase {
  name: string;
  fromOver: number; // inclusive, 0-based
  toOver: number;   // exclusive
  maxFieldersOutside: number;
}

export const ODI_POWERPLAYS: PowerplayPhase[] = [
  { name: 'PP1', fromOver: 0,  toOver: 10, maxFieldersOutside: 2 },
  { name: 'PP2', fromOver: 10, toOver: 40, maxFieldersOutside: 4 },
  { name: 'PP3', fromOver: 40, toOver: 50, maxFieldersOutside: 5 },
];
