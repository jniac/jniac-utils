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

export function useSearchState<T extends object>(getIntialState: () => T): [T, (value: T) => void]
export function useSearchState<T extends object>(initialState: T): [T, (value: T) => void]
export function useSearchState<T extends object>(getIntialState: () => T) {

  if (typeof getIntialState === 'object') {
    const initialState = getIntialState
    getIntialState = () => initialState
  }

  const [state, setState] = useState(() => {
    const state = getIntialState() as any
    const url = new window.URL(document.location.href)
    for (const [key, value] of url.searchParams.entries()) {
      switch (typeof state[key]) {
        case 'boolean':
          state[key] = /true/i.test(value)
          break
        case 'number':
          state[key] = parseFloat(value)
          break
        default:
          state[key] = value
          break
      }
    }
    return state as T
  })

  const setSearchState = useCallback((state: T) => {
    const url = new window.URL(document.location.href)
    for (const key in state) {
      url.searchParams.set(key, String(state[key]))
    }
    window.history.pushState(null, '', url.href)
    setState(state)
  }, [])

  return [state, setSearchState]
}
