# utils/solvers

Tricky?

The idea is to provide a declarative way to declare (sic) children of observable,
for a React usage, but not only.

## usage

### basic
Here below, we are declaring a solver that is saying:  
- if scroll is bigger than 10, i'm `"hidden"`.
- if the video is paused, i'm `"normal"`.
- if the user has just interacted, i'm `"normal"` too.
- otherwise i'm `"minimized"`.
```js
  const controls = new Solver('minimized', { scroll, playState, userJustInteracted }, ({ 
    scroll, 
    playState,
    userJustInteracted,
  }) => {
    // If one of the observable changes, the solver will compute this to know the new inner value.
    // Here it's easy to describe what we want:

    // First the scroll, if greater than 10 NEVER show the controls.
    if (scroll.value > 10) {
      return 'hidden'
    }

    // If the video is paused then show the controls.
    if (playState.value === 'paused') {
      return 'normal'
    
    }
    // Or if the user interacted too.
    if (userJustInteracted.value) {
      return 'normal'
    }

    // Without what, only display the progress bar.
    return 'minimized'
  })
```




// THIS IS OBSOLETE BELOW

### destroy
Observable children are destroyable, so
```js
const child = solver.createChild(false)

// here everything happens as before
child.setValue(true) // "current value is: true" to the console

// but if call destroy, we can notice that the value is updated:
child.destroy() // "current value is: false" to the console
```

### immutable children
That property give us a way to declare immutable children
```js
const { destroy } = solver.createImmutableChild(true) // "current value is: true" to the console
destroy() // "current value is: false" to the console
```
Here react developers may recognize a famous pattern. That's why with `useSolverChild()`, 
`useSolverImmutableChild()` is shipped too:
```jsx
const MyComponent = () => {
  // Here, we are saying "whatever, UI.hudOpening should be true, as long as <ProjectsSearch/> is mounted"
  useSolverImmutableChild(menuIsExpanded, true)
  return <div>Some cool component</div>
}
```



### props
Children can have props. This allows to declare more complexe solver, here the solver is saying:
> Children may have a priority value associated, if so, my inner value will be the
> one of the child with the greater priority (whatever their inner value could be), 
> otherwise if only one is true then i'm true too.
```ts
const solver = new Solver<boolean, { priority: number }>(false, children => {
  const priorityValue = children
    .filter(c => c.props.priority !== undefined)
    .sort((x, y) => y.props.priority! - x.props.priority!)
    [0] // or `.at(0)`
    ?.value
  return priorityValue ?? children.some(c => c.value)
})
```