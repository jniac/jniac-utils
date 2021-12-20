# utils/solvers

Tricky?

The idea is to provide a declarative way to declare (sic) children of observable,
for a React usage, but not only.

## usage

### basic
Here below, we are declaring a solver that is saying:  
> If any child of me has true as inner value, then i'm having true too.
```js
const solver = new Solver(false, children => values.some(c => c.value))

// For the moment value is false (the initial given value)
console.log(solver.value) // false

// If the solver change, print the new value
solver.onChange(newValue => console.log(`current value is: ${newValue}`))

// Here we create a child (which can be seen as a dependency of the solver)
const child = solver.createChild(false)

// solver is still set to false, because the child as false as initialValue
console.log(solver.value) // false

// but will change as soon as we change the child value:
child.setValue(true) // "current value is: true" to the console
```

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