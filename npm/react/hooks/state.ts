import { useCallback, useState } from 'react'


export function useLocalStorageState<T extends object>(identifier: string, getIntialState: () => T): [T, (value: T) => void]
export function useLocalStorageState<T extends object>(identifier: string, initialState: T): [T, (value: T) => void]
export function useLocalStorageState<T extends object>(identifier: string, getIntialState: () => T) {

  if (typeof getIntialState === 'object') {
    const initialState = getIntialState
    getIntialState = () => initialState
  }

  const [state, setState] = useState(() => {
    const str = localStorage.getItem(identifier)
    if (str) {
      const data = JSON.parse(str)
      return { ...getIntialState(), ...data } as T
    }
    return getIntialState()
  })

  const setLocalStorageState = useCallback((state: T) => {
    const str = JSON.stringify(state)
    localStorage.setItem(identifier, str)
    setState(state)
  }, [identifier])

  return [state, setLocalStorageState]
}
