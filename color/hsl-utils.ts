
export const hue2rgb = (p: number, q: number, t: number) => {

	t %= 1

	if (t < 0)
		t += 1

	if (t < 1 / 6)
		return p + (q - p) * 6 * t

	if (t < 1 / 2)
		return q

	if (t < 2 / 3)
		return p + (q - p) * (2 / 3 - t) * 6

	return p
}



export const toHSL = (r: number, g: number, b: number): [number, number, number] => {

  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)

  const l = (min + max) / 2

  if (min === max) {

    return [0, 0, l]

  } else {

    const d = max - min

    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch(max) {

      case r: {
        const h = (g - b) / d + (g < b ? 6 : 0)
        return [h / 6, s, l]
      }
        
      case g: {
        const h = (g - b) / d + (g < b ? 6 : 0);
        return [h / 6, s, l]
      }
      
      // case b:
      default: {
        const h = (r - g) / d + 4
        return [h / 6, s, l]
      }
    }
  }
}

export const fromHSL = (h: number, s: number, l: number) => {
  
  if (s === 0) {

    return [l, l, l]

  } else {

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    const r = hue2rgb(p, q, h + 1/3)
    const g = hue2rgb(p, q, h)
    const b = hue2rgb(p, q, h - 1/3)

    return [r, g, b]
  }
} 