import { Observable } from 'utils/observables'

const safeParseUrl = (str: string) => {

  let {
    pathname, search, hash, origin,
  } = new URL(str, window.location.href)

  pathname = pathname.replace(/\/\//g, '/')
  search = search.substring(1)
  hash = hash.substring(1)

  const href = `${origin}${pathname}?${search}#${hash}`.replace(/[?#=]+$/, '')

  return {
    pathname,
    search,
    hash,
    href,
  }
}

export const location = (() => {

  const {
    href, pathname, search, hash,
  } = safeParseUrl(window.location.href)

  const location = {
    href: new Observable(href),
    pathname: new Observable(pathname),
    search: new Observable(search),
    hash: new Observable(hash),
    isHome: () => location.pathname.value === '/',
  }

  return location
})()

export type Location = typeof location
export const internalUpdate = (url: string) => {

  const {
    href, pathname, search, hash,
  } = safeParseUrl(url)

  const hasChanged = location.href.setValue(href)
  location.pathname.setValue(pathname)
  location.search.setValue(search)
  location.hash.setValue(hash)

  return {
    href,
    pathname,
    search,
    hash,
    hasChanged,
  }
}

export const setUrl = (url: string, { replace = false } = {}) => {

  const { href, hasChanged } = internalUpdate(url)

  if (hasChanged) {
    if (replace) {
      window.history.replaceState({}, '', href)
    } else {
      window.history.pushState({}, '', href)
    }
  }
}

export const setLocation = ({
  pathname = location.pathname.value,
  search = location.search.value,
  hash = location.hash.value,
  replace = false,
}) => {
  setUrl(`${window.location.origin}/${pathname}?${search}#${hash}`, { replace })
}

export const getPathname = () => location.pathname.value
export const setPathname = (pathname: string, { replace = false } = {}) => setLocation({ pathname, replace })
export const getSearch = () => location.search.value
export const setSearch = (search: string, { replace = false } = {}) => setLocation({ search, replace })
export const getHash = () => location.hash.value
export const setHash = (hash: string, { replace = false } = {}) => setLocation({ hash, replace })

window.addEventListener('popstate', () => {
  internalUpdate(window.location.href)
})

