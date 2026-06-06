export function formatSigned(value: number): string {
    return value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
}