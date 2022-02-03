
export const mapValues = <V1, V2>(
  source: Record<string, V1>, 
  map: (value: V1, key: string) => V2,
): Record<string, V2> => {
  return Object.fromEntries(
    Object.entries(source)
      .map(([key, value]) => [key, map(value, key)])
  )
}
