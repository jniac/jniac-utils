import React from 'react'
import { location } from '../../../router/location'

const useUpdate = (callback: (update: () => void) => ({ destroy: () => void} )) => {
  // Re-render when pathname has changed
  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  // No, no. We don't want to make infinite loop because "callback" has been redefined!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => callback(forceUpdate).destroy, [])
}

export const usePathname = () => {
  useUpdate(update => location.pathname.onChange(update))
  return location.pathname.value
}

export const usePathnameAndOld = () => {
  useUpdate(update => location.pathname.onChange(update))
  return [location.pathname.value, location.pathname.valueOld]
}

export const useSearch = () => {
  useUpdate(update => location.search.onChange(update))
  return location.search.value
}
