export class KeffBandInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KeffBandInputError';
    }
}