import { Observable } from '../observables'

export let homepage = '' as string

const processPathname = (str: string) => {
  
  // First (and absolutely first), remove double slashes.
  str = str.replace(/\/\//g, '/') 

  // Handle "homepage".
  if (homepage && str.startsWith(homepage)) {
    str = str.slice(homepage.length)
  }    

  // Remove trailing slash
  if (str.endsWith('/')) {
    str = str.slice(0, -1)
  }

  // Ensure the minimal value (as does the browser).
  if (str === '') {
    str = '/'
  }

  return str
}

const safeParseUrl = (str: string) => {

  let {
    pathname, search, hash, origin,
  } = new window.URL(str)

  pathname = processPathname(pathname)
  search = search.substring(1)
  hash = hash.substring(1)

  const href = `${origin}${homepage}${pathname}?${search}#${hash}`
    .replace(/\?#/, '#')
    .replace(/[?#=]+$/, '')

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

  const hrefHasChanged = location.href.setValue(href, { ignoreCallbacks: true })
  const pathnameHasChanged = location.pathname.setValue(pathname, { ignoreCallbacks: true })
  const searchHasChanged = location.search.setValue(search, { ignoreCallbacks: true })
  const hashHasChanged = location.hash.setValue(hash, { ignoreCallbacks: true })

  // NOTE: important here to change EVERY parts BEFORE calling the callbacks
  // (since any callbacks should retrieve any parts with new value)
  if (hashHasChanged) location.hash.triggerChangeCallbacks()
  if (searchHasChanged) location.search.triggerChangeCallbacks()
  if (pathnameHasChanged) location.pathname.triggerChangeCallbacks()
  if (hrefHasChanged) location.href.triggerChangeCallbacks()

  return {
    href,
    pathname,
    search,
    hash,
    hasChanged: hrefHasChanged,
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
  setUrl(`${window.location.origin}/${homepage}/${pathname}?${search}#${hash}`, { replace })
}

export const getPathname = () => location.pathname.value
export const getPathnameOld = () => location.pathname.valueOld
export const setPathname = (pathname: string, { replace = false } = {}) => setLocation({ pathname, replace })
export const getSearch = () => location.search.value
export const setSearch = (search: string, { replace = false } = {}) => setLocation({ search, replace })
export const getHash = () => location.hash.value
export const setHash = (hash: string, { replace = false } = {}) => setLocation({ hash, replace })

window.addEventListener('popstate', () => {
  internalUpdate(window.location.href)
})

window.addEventListener('hashchange', () => {
  internalUpdate(window.location.href)
}, false)



/**
 * Same concept that react homepage.
 * 
 * If homepage = /foo then /foo/bar is treated as /bar
 * 
 * Since this will reset location state, this must be called before everything else.
 * 
 * "homepage" Must start with "/"
 */
export const setHomepage = (value: string) => {
  if (value.startsWith('/') === false) {
    throw new Error('"homepage" Must start with "/"')
  }
  if (homepage !== value) {
    homepage = value
    location.href.setValue('')
    location.pathname.setValue('')
    location.search.setValue('')
    location.hash.setValue('')
    setUrl(window.location.href)
  }
}
