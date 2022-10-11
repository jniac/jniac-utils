import { Register } from '../collections'

export interface IMessage {
  target: any
  type: any
  props?: any
  sendModality?: ISendModality
}

export interface IMessageSent {
  stopPropagation: () => void
}

type MessageCallback = (message: any) => void

interface ISendModality {
  propagation: (currentTarget: any) => any[]
}

interface IListener {
  type: any
  test: (type: any) => boolean
  callback: MessageCallback
  priority: number
}

const register = new Register<any, IListener>()

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
    const result = [] as IListener[]
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

const __send = <M extends IMessage = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: ISendModality,
) => {
  const callbacks = [
    ...getMatchingCallbacks('*', '*'),
    ...getMatchingCallbacks(target, type)
  ]
  if (callbacks) {
    const message: IMessage & IMessageSent = {
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

export function send<M extends IMessage = any>(message: M): M
export function send<M extends IMessage = any>(
  target: M['target'],
  type: M['type'],
  props?: M['props'],
  modality?: ISendModality,
): M
export function send(...args: any[]) {
  if (args.length === 1) {
    const message = args[0] as IMessage
    return __send(message.target, message.type, message.props, message.sendModality)
  }
  else if (args.length > 1) {
    return __send(args[0], args[1], args[2], args[3])
  }
  throw new Error('Oops.')
}

export const on = <M extends IMessage>(
  target: M['target'],
  type: M['type'],
  callback: (message: M & IMessageSent) => void,
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

// OBSOLETE: Backward compatibility
export type { IMessage as Message }

// RAW TEST: PRIORITY
// on('lol', '*', m => console.log(m.type, 'lol #0'))
// on('lol', 'ok', m => console.log(m.type, 'lol #100'), { priority: 100 })
// on('lol', /ok/, m => console.log(m.type, 'lol #Infinity'), { priority: Infinity })
// send('lol', 'ok')