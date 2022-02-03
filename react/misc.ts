
/**
 * Allow concise className declaration. Eg:
 * 
 *      const MyComp: React.FC<{ minimized: boolean }> => ({ minimized }) => {
 *        return (
 *          <div className={safeClassName('MyComp', { minimized })} />
 *        )
 *      }
 */
export const safeClassName = (...args: any[]) => args
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


  export function mapWithSeparator<T, U, V>(
    data: T[],
    map: (item: T, index: number) => U,
    separator: (autoKey: string, index: number) => V,
  ) {
  
    if (data.length === 0) {
      return []
    }
  
    const result = [map(data[0], 0)] as (T | U | V)[]
    for (let index = 1; index < data.length; index++) {
      result.push(separator(`separator-${index-1}`, index - 1))
      result.push(map(data[index], index))
    }
    return result
  }