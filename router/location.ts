import { Observable } from '../observables'

export let homepage = '' as string

const processPathname = (str: string) => {
  // First (and absolutely first), remove double slashes.
  str = str.replace(/[/]{2,}/g, '/')

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

const safeParseUrl = (str: string, useWindowHref: boolean) => {
  let {
    pathname,
    search,
    hash,
    origin,
  } = new window.URL(str, useWindowHref ? window.location.href : window.location.origin)

  pathname = processPathname(pathname)
  search = search.substring(1)
  hash = hash.substring(1)

  const href = `${origin}${homepage}${pathname}?${search}#${hash}`
    .replace(/\?#/, '#')  // remove "?" before "#"
    .replace(/[?#=]+$/, '') // remove trailing "?", "#" or "="

  return {
    pathname,
    search,
    hash,
    href,
  }
}

export class Location {
  /**
   * #props hide the private parts of location. The reference is also used as 
   * owner of the observables.
   */
  #props: {
    name: string
    useWindowHref: boolean
  }
  
  get name() { return this.#props.name }

  href: Observable<string>
  pathname: Observable<string>
  search: Observable<string>
  hash: Observable<string>

  isHome: () => boolean

  constructor(name: string, initialUrl = '/', {
    useWindowHref = false
  } = {}) {
    const {
      href,
      pathname,
      search,
      hash,
    } = safeParseUrl(initialUrl, useWindowHref)

    this.#props = { name, useWindowHref }

    this.href = new Observable(href)
    this.pathname = new Observable(pathname)
    this.search = new Observable(search)
    this.hash = new Observable(hash)

    this.isHome = () => this.pathname.value === '/'

    this.href.own(this.#props)
    this.pathname.own(this.#props)
    this.search.own(this.#props)
    this.hash.own(this.#props)
  }

  update(url: string) {
    const props = this.#props

    const {
      href,
      pathname,
      search,
      hash,
    } = safeParseUrl(url, props.useWindowHref)

    // NOTE: important here to change EVERY parts BEFORE calling the callbacks
    // (since any callbacks should retrieve any parts with new value)
    const hasChanged = this.href.setValue(href, { owner: props, ignoreCallbacks: true })
    const pathnameHasChanged = this.pathname.setValue(pathname, { owner: props, ignoreCallbacks: true })
    const searchHasChanged = this.search.setValue(search, { owner: props, ignoreCallbacks: true })
    const hashHasChanged = this.hash.setValue(hash, { owner: props, ignoreCallbacks: true })

    // NOTE: Why "force" here? In a very strange case, the inner "hasChanged" was 
    // reset to false, preventing the callbacks to be called. Fixed by the "force"
    // option. But it is not cool :( 
    if (hashHasChanged) this.hash.triggerChangeCallbacks({ owner: props, force: true })
    if (searchHasChanged) this.search.triggerChangeCallbacks({ owner: props, force: true })
    if (pathnameHasChanged) this.pathname.triggerChangeCallbacks({ owner: props, force: true })
    if (hasChanged) this.href.triggerChangeCallbacks({ owner: props, force: true })

    return {
      href,
      pathname,
      search,
      hash,
      hasChanged,
    }
  }
}

export const location = new Location('window', window.location.href, { useWindowHref: true })

export const setUrl = (url: string, { replace = false } = {}) => {
  const { href, hasChanged } = location.update(url)

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
  setUrl(`${window.location.origin}${homepage}/${pathname}?${search}#${hash}`, { replace })
}

export const getPathname = () => location.pathname.value
export const getPathnameOld = () => location.pathname.valueOld
export const setPathname = (pathname: string, { replace = false } = {}) => setLocation({ pathname, replace })
export const getSearch = () => location.search.value
export const setSearch = (search: string, { replace = false } = {}) => setLocation({ search, replace })
export const clearSearch = ({ replace = false } = {}) => setLocation({ search: '', replace })
export const getHash = () => location.hash.value
export const setHash = (hash: string, { replace = false } = {}) => setLocation({ hash, replace })
export const clearHash = ({ replace = false } = {}) => setLocation({ hash: '', replace })

window.addEventListener('popstate', () => {
  location.update(window.location.href)
})

window.addEventListener('hashchange', () => {
  location.update(window.location.href)
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
    location.update('')
    setUrl(window.location.href)
  }
}
