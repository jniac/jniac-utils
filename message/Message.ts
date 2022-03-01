import { Register } from '../collections'

export interface Message {
  target: any
  type: any
  props?: any
  sendModality?: SendModality
}

interface MessageSent {
  stopPropagation: () => void
}

type MessageCallback = (message: any) => void

interface SendModality {
  propagation: (currentTarget: any) => any[]
}

interface Listener {
  type: any
  callback: MessageCallback
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

const __send = <M extends Message = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: SendModality,
) => {
  const callbacks = getMatchingCallbacks(target, type)
  if (callbacks) {
    const message: Message & MessageSent = {
      target,
      type,
      props,
      stopPropagation: () => {},
    }
    for (const callback of callbacks) {
      callback(message)
    }
  }
  // TODO: SendModality!
}
export function send<M extends Message = any>(message: M): void
export function send<M extends Message = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: SendModality,
): void
export function send(...args: any[]) {
  if (args.length === 1) {
    const message = args[0] as Message
    __send(message.target, message.type, message.props, message.sendModality)
  }
  else if (args.length > 1) {
    __send(args[0], args[1], args[2], args[3])
  }
}

export const on = <M extends Message>(
  target: M['target'],
  type: M['type'],
  callback: (message: M & MessageSent) => void,
) => {
  const listener = { type, callback }
  register.add(target, listener)
  const destroy = () => {
    register.remove(target, listener)
  }
  return { destroy }
}