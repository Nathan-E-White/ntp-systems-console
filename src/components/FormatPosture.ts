export type FormattablePosture = string;

export function formatPosture<TPosture extends FormattablePosture>(posture: TPosture): string {
    return posture.replaceAll('-', ' ');
}