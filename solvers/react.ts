import React from 'react'
import { ArraySolver } from './Solver'

export const useArraySolverChild = <T>(solver: ArraySolver<T>, initialValue: T) => {
  const child = React.useMemo(() => solver.createChild(initialValue), [solver, initialValue])
  React.useEffect(() => child.destroy, [child])
  return child
}

export const useArraySolverImmutableChild = <T>(solver: ArraySolver<T>, initialValue: T) => {
  const { destroy } = React.useMemo(() => solver.createImmutableChild(initialValue), [solver, initialValue])
  React.useEffect(() => destroy, [destroy])
}

