// export function formatPercent(value: number): string {
//     return `${(value * 100).toFixed(2)}%`;
// }

export const fmtPct = (value: number, numDig: number = 2): string => `${(value * 100).toFixed(numDig)}%`;