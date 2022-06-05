# Switch

`<Switch/>` provides a simplified solution to display, based on an index, one 
component over two or more. When a transition occurs, there are two children 
displayed, one is _"entering"_, the other is _"leaving"_. The onTransition props
allows to operate a cross fade:
```ts
type onTransition = (entering: T | null, leaving: T | null, progress: number) => void
```