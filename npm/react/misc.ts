import { useEffect, useState } from 'react'

/**
 * Allow concise className declaration. Eg:
 * 
 *      const MyComp: React.FC<{ minimized: boolean }> => ({ minimized }) => {
 *        return (
 *          <div className={safeClassName('MyComp', { minimized })} />
 *        )
 *      }
 */
export const safeClassName = (...args: any[]) => {
  return args
    .flat(Infinity)
    .filter(value => !!value)
    .map(value => {
      if (typeof value === 'string') {
        return value
      }
      if (typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => v && k)
      }
      if (value === false) {
        return false
      }
      console.log(`invalid item: ${value}`)
      return undefined
    })
    .flat(Infinity)
    .filter(value => !!value)
    .join(' ')
}

export function mapWithSeparator<T, U, V>(
  data: T[],
  map: (item: T, index: number) => U,
  separator: (autoKey: string, index: number) => V,
) {
  if (!data) {
    throw new Error(`invalid "data" (${data})`)
  }

  if (data.length === 0) {
    return []
  }

  const result = [map(data[0], 0)] as (T | U | V)[]
  for (let index = 1; index < data.length; index++) {
    result.push(separator(`separator-${index - 1}`, index - 1))
    result.push(map(data[index], index))
  }
  return result
}

export const usePointerType = () => {
  const [pointerType, setPointerType] = useState('mouse')
  useEffect(() => {
    let current = pointerType
    const onPointer = (event: PointerEvent): void => {
      if (event.pointerType !== current) {
        current = event.pointerType
        setPointerType(current)
      }
    }
    document.addEventListener('pointermove', onPointer, { capture: true })
    document.addEventListener('pointerdown', onPointer, { capture: true })
    return () => {
      document.removeEventListener('pointermove', onPointer, { capture: true })
      document.removeEventListener('pointerdown', onPointer, { capture: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return pointerType
}
