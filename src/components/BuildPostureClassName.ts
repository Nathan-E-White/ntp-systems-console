export function buildPostureClassName(posture: string): string {
    const normalizedPosture = posture.toLowerCase();

    if (
        normalizedPosture === 'limit' ||
        normalizedPosture === 'excess-reactivity' ||
        normalizedPosture === 'shutdown-margin-concern' ||
        normalizedPosture === 'non-converged'
    ) {
        return 'posture-chip limit';
    }

    if (
        normalizedPosture === 'watch' ||
        normalizedPosture === 'unknown' ||
        normalizedPosture === 'subcritical'
    ) {
        return 'posture-chip watch';
    }

    return 'posture-chip nominal';
}