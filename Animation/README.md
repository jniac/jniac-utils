# Animation

`Animation` is a multi-purpose animation tool.

## Usage

```ts
const target = {
  position: new Vector3(),
  rotation: new Euler(),
}
Animation.tween(target, 1, {
  ease: x => 1 - (1 - x) ** 2,
  to: {
    position: new Vector3(10, 10, 10),
    rotation: {
      ease: x => x * x * x, // "ease" can be overrided per property
      value: new Euler(0, Math.PI, 0),
    },
  },
})
```
