function getItem<T>(key: string): T | null
function getItem<T>(key: string, defaultValue: T): T
function getItem<T>(key: string, defaultValue?: T) {
  const value = localStorage.getItem(key)
  return value === null ? defaultValue ?? null : (JSON.parse(value) as T)
}

function setItem<T = any>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const jsonLocalStorage = {
  getItem,
  setItem,
}
