/**
 * Chunk an array to a 2d array each.
 * Each chunk length is not bigger than specified size (default 3).
 * @param arr the array to be chunked
 * @param size chunk size default to 3
 */
export function chunk<T> (arr: T[], size = 3) {
  if (size < 1) throw new RangeError('chunk size must be at least 1!')
  var arr2: T[][] = []
  for (let i = 0, j = 0; j < arr.length; j += size) {
    arr2[i++] = arr.slice(j, j + size)
  }
  return arr2
}
