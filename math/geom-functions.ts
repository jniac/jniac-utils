
export const dotProduct = (ux: number, uy: number, vx: number, vy: number) => ux * vx + uy * vy

export const euclideanDistance2D = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const euclideanDistance3D = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z)

export const euclideanDistance = (...numbers: number[]) => {
  let sum = 0
  for (const x of numbers) {
    sum += x * x
  }
  return Math.sqrt(sum)
}
