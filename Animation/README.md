# Animation

`Animation` is a multi-purpose animation tool.

## Usage

```ts
const target = {
  alpha: 1,
  position: new Vector3(),
  rotation: new Euler(),
  scale: new Vector3(1, 1, 1),
  size: new Vector3(1, 1, 1),
}

Animation.tween(target, 1, {
  // Defining a default ease for any property:
  ease: x => 1 - (1 - x) ** 2,

  to: {
    // Plain value, ok.
    alpha: 2,

    // Composite value, ok too (each sub property is interpolated independently).
    position: new Vector3(10, 10, 10),

    // Property override.
    // "ease" can be overrided per property:
    rotation: {
      value: new Euler(0, Math.PI, 0),
      ease: x => x ** 3,
    },

    // Property override.
    // "transform" allow to rewrite the interpolated value at the last moment:
    scale: {
      value: new Vector3(5, 5, 5),
      transform: v => v.set(v.x, v.y, Math.min(v.z, 2)),
    },

    // Property override.
    // Sub property may also be overrided:
    size: {
      x: 2, 
      y: {
        value: 2,
        ease: x => 1 - (1 - x) ** 5,
      },
      z: {
        value: 2,
        ease: x => 1 - (1 - x) ** 5,
        transform: x => Math.min(x, 1.5),
      } 
    },
  },
  onProgress: () => console.log(target.size)
})
```
