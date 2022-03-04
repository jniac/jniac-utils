
export const sawtoothWave = (x: number, period = 1, offset = 0) => {
  const y = x + offset
  return y < 0 ? period + (y % period) : y % period
}

export const triangleWave = (x: number, period = 1, offset = 0) => {
  const y = sawtoothWave(x, period, offset)
  return (y < period ? period : 1 - period) * 2
}
