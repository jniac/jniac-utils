import React from 'react'
import { Options, handlePointer } from '../dom/handle-events'

export function usePointerHandle(ref: React.RefObject<HTMLElement>, options: Options) {

  React.useEffect(() => {
    
    const { destroy } = handlePointer(ref.current!, options)
    return destroy

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
