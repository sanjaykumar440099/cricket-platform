/**
 * Resource % remaining based on overs left & wickets lost
 * oversLeft -> wicketsLost -> resource %
 */
export const DLS_RESOURCE_TABLE: Record<number, number[]> = {
  50: [100, 93, 85, 74, 62, 49, 36, 24, 13, 5, 0],
  40: [90, 84, 76, 66, 55, 43, 32, 21, 11, 4, 0],
  30: [75, 70, 63, 54, 45, 35, 26, 17, 9, 3, 0],
  20: [56, 52, 47, 41, 34, 27, 20, 13, 7, 2, 0],
  10: [32, 30, 27, 24, 20, 16, 12, 8, 4, 1, 0],
};
