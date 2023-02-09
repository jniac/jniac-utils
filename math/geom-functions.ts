
export const dotProduct = (ux: number, uy: number, vx: number, vy: number) => ux * vx + uy * vy

export const cross3 = <T extends { x: number, y: number, z: number }>(ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, out: T): T => {
  out.x = uy * vz - uz * vy
  out.y = uz * vx - ux * vz
  out.z = ux * vy - uy * vx
  return out
}

export const euclideanDistance2D = (x: number, y: number) => Math.sqrt(x * x + y * y)

export const euclideanDistance3D = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z)

export const euclideanDistance = (...numbers: number[]) => {
  let sum = 0
  for (const x of numbers) {
    sum += x * x
  }
  return Math.sqrt(sum)
}
