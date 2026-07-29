const getSecureRandomInt = (min: number, max: number): number => {
  const range = max - min + 1
  const maxVal = 2147483647
  const threshold = maxVal - (maxVal % range)
  let random: number
  do {
    random = crypto.getRandomValues(new Uint32Array(1))[0]
  } while (random >= threshold)
  return min + (random % range)
}

export const secureRandomInt = (min: number, max: number): number => {
  return getSecureRandomInt(min, max)
}

export const secureRandomElement = <T>(arr: readonly T[]): T => {
  return arr[getSecureRandomInt(0, arr.length - 1)]
}

export const secureRandomDate = (start: Date, end: Date): string => {
  const range = end.getTime() - start.getTime()
  const maxVal = 2147483647
  const threshold = maxVal - (maxVal % range)
  let random: number
  do {
    random = crypto.getRandomValues(new Uint32Array(1))[0]
  } while (random >= threshold)
  return new Date(start.getTime() + (random % range)).toISOString()
}
export const secureRandomFloat = (
  min: number,
  max: number,
  decimals = 2,
): number => {
  const factor = 10 ** decimals

  return secureRandomInt(
    Math.round(min * factor),
    Math.round(max * factor),
  ) / factor
}

export const secureUUID = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [
    bytes[0],
    bytes[1],
    bytes[2],
    bytes[3],
    bytes[4],
    bytes[5],
    bytes[6],
    bytes[7],
    bytes[8],
    bytes[9],
    bytes[10],
    bytes[11],
    bytes[12],
    bytes[13],
    bytes[14],
    bytes[15],
  ]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}