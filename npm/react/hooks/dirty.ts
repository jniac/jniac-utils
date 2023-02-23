import { useMemo, useState } from 'react'

let dirtyCount = 0
/**
 * `useForceUpdate()` callback is limited to `9_007_199_254_740_991` 
 * (Number.MAX_SAFE_INTEGER) calls in a session. 
 * 
 * Is it ok?
 */
export const useSetDirty = (): (() => void) => {
  const [, setCount] = useState(0)
  const setDirty = useMemo(() => () => setCount(++dirtyCount), [])
  return setDirty
}
