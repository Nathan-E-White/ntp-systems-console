import {PowerProfilePosture} from "./PowerProfilePanel";

export function buildProfilePosture(relativePower: number): PowerProfilePosture {
    if (relativePower >= 1.35) {
        return 'limit';
    }

    if (relativePower >= 1.15) {
        return 'watch';
    }

    return 'nominal';
}