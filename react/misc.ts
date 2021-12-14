
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
