import React from 'react'
import { Solver } from '.'

export const useSolverChild = <T>(solver: Solver<T>, initialValue: T) => {
  const child = React.useMemo(() => solver.createChild(initialValue), [solver, initialValue])
  React.useEffect(() => child.destroy, [child])
  return child
}

export const useSolverImmutableChild = <T>(solver: Solver<T>, initialValue: T) => {
  const { destroy } = React.useMemo(() => solver.createImmutableChild(initialValue), [solver, initialValue])
  React.useEffect(() => destroy, [destroy])
}

