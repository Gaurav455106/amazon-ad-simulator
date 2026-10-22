const ALPHABET = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
const ID_BODY_LENGTH = 19;

/**
 * Stable console-style entity ID (e.g. "A02148412WFFCNBHII6CZ") for an internal id.
 * @param {string} id
 * @returns {string}
 */
export function consoleId(id) {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (Math.imul(seed, 31) + id.charCodeAt(i)) >>> 0;
  let out = 'A0';
  for (let i = 0; i < ID_BODY_LENGTH; i++) {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    out += ALPHABET[seed % (i < 7 ? 10 : ALPHABET.length)];
  }
  return out;
}
