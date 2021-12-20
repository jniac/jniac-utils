import { Register } from '../collections'

interface Message<P = any> {
  target: any
  type: any
  props: P
  stopPropagation: () => void
}

type MessageCallback<P = any> = (message: Message<P>) => void

interface SendModality {
  propagation: (currentTarget: any) => any[]
}

interface Listener<P = any> {
  type: any
  callback: MessageCallback<P>
}

const register = new Register<any, Listener>()

const getTypeTester = (type: any) => {
  if (type === '*') {
    return () => true   
  }
  if (type instanceof RegExp) {
    return (x: any) => type.test(String(x))
  }
  if (typeof type === 'string') {
    return (x: any) => x === type
  }
  throw new Error(`invalid type: ${type}`)
}

const getMatchingCallbacks = (target: any, type: any) => {
  const listeners = register.get(target)
  if (listeners) {
    const array = [] as MessageCallback[]
    for (const listener of listeners) {
      const tester = getTypeTester(listener.type)
      if (tester(type)) {
        array.push(listener.callback)
      }
    }
    return array
  }
  return []
}

export const send = <P = any>(
  target: any, 
  type: any, 
  props?: P, 
  modality?: SendModality,
) => {
  const callbacks = getMatchingCallbacks(target, type)
  if (callbacks) {
    const message: Message = {
      target,
      type,
      props,
      stopPropagation: () => {},
    }
    for (const callback of callbacks) {
      callback(message)
    }
  }
}

export const on = <P>(
  target: any,
  type: any,
  callback: MessageCallback<P>,
) => {
  const listener = { type, callback }
  register.add(target, listener)
  const destroy = () => {
    register.remove(target, listener)
  }
  return { destroy }
}