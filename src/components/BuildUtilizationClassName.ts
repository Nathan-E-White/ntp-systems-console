export function buildUtilizationClassName(value: number): string {
    if (value >= 1) {
        return 'utilization-fill limit';
    }

    if (value >= 0.7) {
        return 'utilization-fill watch';
    }

    return 'utilization-fill nominal';
}
