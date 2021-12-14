import React from 'react'
import { Solver } from '.'

export const useSolverChild = <T>(solver: Solver<T>, initialValue: T) => {
  const { child, destroy } = React.useMemo(() => solver.createChild(initialValue), [solver, initialValue])
  React.useEffect(() => destroy, [destroy])
  return child
}

export const useSolverImmutableChild = <T>(solver: Solver<T>, initialValue: T) => {
  const { destroy } = React.useMemo(() => solver.createImmutableChild(initialValue), [solver, initialValue])
  React.useEffect(() => destroy, [destroy])
}

