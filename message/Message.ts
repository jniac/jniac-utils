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
  test: (type: any) => boolean
  callback: MessageCallback
  priority: number
}

const register = new Register<any, Listener>()

const getTypeTest = (type: any) => {
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
    const result = [] as Listener[]
    for (const listener of listeners) {
      if (listener.test(type)) {
        result.push(listener)
      }
    }
    result.sort((A, B) => A.priority > B.priority ? -1 : 1)
    return result.map(listener => listener.callback)
  }
  return []
}

const __send = <M extends Message = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: SendModality,
) => {
  const callbacks = [
    ...getMatchingCallbacks('*', '*'),
    ...getMatchingCallbacks(target, type)
  ]
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
  return {
    target,
    type,
    props,
  } as M
}

export function send<M extends Message = any>(message: M): M
export function send<M extends Message = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: SendModality,
): M
export function send(...args: any[]) {
  if (args.length === 1) {
    const message = args[0] as Message
    return __send(message.target, message.type, message.props, message.sendModality)
  }
  else if (args.length > 1) {
    return __send(args[0], args[1], args[2], args[3])
  }
  throw new Error('Oops.')
}

export const on = <M extends Message>(
  target: M['target'],
  type: M['type'],
  callback: (message: M & MessageSent) => void,
  {
    priority = 0,
  } = {}
) => {
  const listener = { 
    type, 
    priority,
    test: getTypeTest(type),
    callback,
  }
  register.add(target, listener)
  const destroy = () => {
    register.remove(target, listener)
  }
  return { destroy }
}

// RAW TEST: PRIORITY
// on('lol', '*', m => console.log(m.type, 'lol #0'))
// on('lol', 'ok', m => console.log(m.type, 'lol #100'), { priority: 100 })
// on('lol', /ok/, m => console.log(m.type, 'lol #Infinity'), { priority: Infinity })
// send('lol', 'ok')