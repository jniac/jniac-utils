# Message

## Usage
```ts
interface PopinMessage extends Message.Message {
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
