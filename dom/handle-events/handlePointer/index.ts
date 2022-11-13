// export * from './pointer'
// NOTE: above does not work, need instead to explictly export methods and types.
// Why? 
// Don't know.
export { handlePointer } from './pointer'
export type { Options } from './pointer'
export type { DragInfo } from './drag'
export type { PinchInfo } from './pinch'
export type { WheelFrameInfo } from './wheel'