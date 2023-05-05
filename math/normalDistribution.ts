
/**
 * https://www.desmos.com/calculator/lqdi4lyphr
 */
export const normalDistribution = (x: number, sigma = 1, mean = 0): number => {
  const sq = Math.sqrt(2 * Math.PI)
  const c = (x - mean) / sigma
  return 1 / (sigma * sq) * Math.exp(-.5 * c * c)
}

/**
 * Computes and returns a gaussian kernel [size x size] as a flat array.
 * 
 * Helpful to compute average in 2D spaces (eg: shaders).
 */
export const computeGaussianKernel = (size: number, {
  halfWidth = 2.5,
  sigma = 1,
} = {}): number[] => {
  // 1. Initialize the "line".
  const line: number[] = Array.from({ length: size })
  for (let i = 0; i < size; i++) {
    const x = (i / (size - 1) - .5) * 2 * halfWidth * sigma
    line[i] = normalDistribution(x, sigma, 0)
  }

  // 2. Compute the grid value (line x line).
  const sqSize = size * size
  const kernel: number[] = Array.from({ length: sqSize })
  let sum = 0
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const value = line[i] * line[j]
      sum += value
      const index = j * size + i
      kernel[index] = value
    }
  }

  // 3. Scale according the actual sum value (which is close to 1, but not 1, 
  // since the kernel is a discrete sample).
  const scale = 1 / sum
  for (let i = 0; i < sqSize; i++) {
    kernel[i] *= scale
  }

  return kernel
}