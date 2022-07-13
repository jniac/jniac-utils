import { Color, ColorRepresentation } from 'three'

export type ColorKey = keyof typeof helperConfig.color
export type ColorArg = ColorKey | ColorRepresentation

export const helperConfig = {
  color: {
    'axis-x': '#f33',
    'axis-y': '#3c6',
    'axis-z': '#36f',
    'axis-yellow': '#fc3',
  },
  'axis-radius': .01,
}

export const getColor = (colorArg: ColorArg) => new Color(helperConfig.color[colorArg as ColorKey] ?? colorArg)
