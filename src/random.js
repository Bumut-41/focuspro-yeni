/** Her test koşusunda uyaran dizisi birebir aynı olsun diye sabit tohum. */
export const FIXED_TEST_SEED = 1_234_567_89;

let seed = FIXED_TEST_SEED;

export function resetSeed() {
  seed = FIXED_TEST_SEED;
}

export function seededRandom() {
  seed = (1_664_525 * seed + 1_013_904_223) % 4_294_967_296;
  return seed / 4_294_967_296;
}

export function pickSeeded(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}
