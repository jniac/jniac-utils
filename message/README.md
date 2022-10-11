# Message

## Usage

### Via dedicated module (preferred option)
```ts
// file: my-object-message.ts

import { IMessageSent, Message } from 'some-utils/message'
import { MyObject } from './MyObject'

export type MyObjectMessageType = 
  | 'SOME-MESSAGE-TYPE'
  | 'ANOTHER-MESSAGE-TYPE'

export type MyObjectMessageProps = {
  myObjectInstance: MyObject
  myTimestamp: number
}

interface IMyObjectMessage {
  target: 'INTERNAL-TARGET-UNIQUE-IDENTIFIER'
  type: MyObjectMessageType
  props: MyObjectMessageProps
}

export const MyObjectMessage = {
  send: (type: MyObjectMessageType, props: IMyObjectMessage['props']) => {
    return Message.send<IMyObjectMessage>('INTERNAL-TARGET-UNIQUE-IDENTIFIER', type, props)
  },
  on: (type: MyObjectMessageType, callback: (message: IMyObjectMessage & IMessageSent) => void) => {
    return Message.on<IMyObjectMessage>('INTERNAL-TARGET-UNIQUE-IDENTIFIER', type, callback)
  }
}
```
`MyObjectMessage` usage:
```ts
// somewhere:
MyObjectMessageType.send('SOME-MESSAGE-TYPE', {
  myObjectInstance: myObject,
  myTimestamp: Date.now(),
})

// somewhere else:
MyObjectMessageType.on('SOME-MESSAGE-TYPE', ({
  myObjectInstance,
  myTimestamp,
}) => {
  // do something...
})
```



### Via interface
```ts
interface PopinMessage extends Message.IMessage {
  target: 'POPIN'
  type: 'SHOW' | 'HIDE'
  props: {
    node: React.ReactNode
    popinRect: Rectangle
    safeRect: Rectangle
    anchor?: Point
    divProps?: React.HTMLAttributes<HTMLDivElement>
  }
}

const MyComponent: React.FC = () => {

  useComplexEffects(function*() {
    yield Message.on<PopinMessage>('POPIN', 'SHOW', ({ props }) => {
      setState({ show: true, ...props })
    })
    yield Message.on('POPIN', 'HIDE', hide)
  }, [])

  return (
    ...
  )
}
```
