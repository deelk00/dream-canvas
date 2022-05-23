
/**
 * a function to round to safe values
 * @param {number} value to round,
 * @param {number} decimals max 17 (javascript limit)
 */
export function round(value: number, decimals: number = 16) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}