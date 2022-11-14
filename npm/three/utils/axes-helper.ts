import { ConeGeometry, CylinderGeometry, RawShaderMaterial, ShaderMaterialParameters, Vector3 } from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { ColorArg, helperConfig, getColor } from './helper-config'
import { setVertexColor } from './vertex-color'
import { getGeometryTransformer } from './transform-geometry'

export type CreateSingleAxeGeometryOptions = Partial<{
  axis: 'x' | 'y' | 'z'
  length: number
  color: ColorArg
  radius: number
  radiusScale: number
}>
/**
 * Create axes geometry: 3 arrow X, Y, Z with vertex colors.
 */
export const createSingleAxeGeometry = ({
  axis = 'x',
  length = 1,
  color = '#fc0',
  radius = helperConfig['axis-radius'],
  radiusScale = 1,
}: CreateSingleAxeGeometryOptions = {}) => {

  radius *= radiusScale

  if (axis !== 'x') {
    throw new Error('Not implemented!')
  }

  const { transform } = getGeometryTransformer()

  const _color = getColor(color)

  const coneHeight = radius * 8
  const cone = new ConeGeometry(radius * 3, coneHeight)
  const cyl = new CylinderGeometry(radius, radius, 1)

  const cylLength = length - coneHeight
  const coneDistance = length - coneHeight * .5
  const cylDistance = cylLength * .5

  transform(cone, { x: coneDistance, rz: -90 })
  transform(cyl, { x: cylDistance, sy: cylLength, rz: -90 })
  setVertexColor(cone, _color)
  setVertexColor(cyl, _color)

  return mergeBufferGeometries([
    cyl, cone,
  ], false)
}



export type CreateAxesGeometryOptions = Partial<{
  color: ColorArg
  colorX: ColorArg
  colorY: ColorArg
  colorZ: ColorArg
  radius: number
  radiusScale: number
  alignMode: 'positive' | 'center' | 'negative'
}>
/**
 * Create axes geometry: 3 arrow X, Y, Z with vertex colors.
 */
export const createAxesGeometry = ({
  color,
  colorX = color ?? 'axis-x',
  colorY = color ?? 'axis-y',
  colorZ = color ?? 'axis-z',
  radius = helperConfig['axis-radius'],
  radiusScale = 1,
  alignMode = 'positive', 
}: CreateAxesGeometryOptions = {}) => {

  radius *= radiusScale

  const { transform } = getGeometryTransformer()

  const _colorX = getColor(colorX)
  const _colorY = getColor(colorY)
  const _colorZ = getColor(colorZ)

  const coneHeight = radius * 8
  const cone1 = new ConeGeometry(radius * 3, coneHeight)
  const cyl1 = new CylinderGeometry(radius, radius, 1)
  const cone2 = cone1.clone()
  const cyl2 = cyl1.clone()
  const cone3 = cone1.clone()
  const cyl3 = cyl1.clone()

  const align = {
    'positive': .5,
    'center': 0,
    'negative': -.5,
  }[alignMode]

  const cylLength = 1 - coneHeight
  const coneDistance = .5 + align - coneHeight * .5
  const cylDistance = cylLength * .5 + align - .5

  transform(cone1, { x: coneDistance, rz: -90 })
  transform(cyl1, { x: cylDistance, sy: cylLength, rz: -90 })
  setVertexColor(cone1, _colorX)
  setVertexColor(cyl1, _colorX)

  transform(cone2, { y: coneDistance })
  transform(cyl2, { y: cylDistance, sy: cylLength })
  setVertexColor(cone2, _colorY)
  setVertexColor(cyl2, _colorY)

  transform(cone3, { z: coneDistance, rx: 90 })
  transform(cyl3, { z: cylDistance, sy: cylLength, rx: 90 })
  setVertexColor(cone3, _colorZ)
  setVertexColor(cyl3, _colorZ)

  return mergeBufferGeometries([
    cyl1, cone1,
    cyl2, cone2,
    cyl3, cone3,
  ], false)
}



// heavily inspired by https://github.com/oframe/ogl/blob/master/examples/base-primitives.html
export const createAxesMaterial = ({
  uniforms = {},
  opacity = 1,
  lightPosition = new Vector3(.3, .8, .6),
  flatShading = 0,
  ...props
}: Partial<{
  lightPosition: Vector3
  flatShading: number
}> & Omit<ShaderMaterialParameters, 'vertexShader' | 'fragmentShader'> = {}) => {
  
  const vertexShader = /* glsl */`
    attribute vec3 position, normal, color;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal, vColor;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  
  const fragmentShader = /* glsl */`
    precision highp float;
    varying vec3 vNormal, vColor;
    uniform vec3 uLightPosition;
    uniform float uOpacity, uFlatShading;
    void main() {
      float lighting = dot(vNormal, uLightPosition);
      gl_FragColor.rgb = vColor + lighting * 0.3 * (1.0 - uFlatShading);
      gl_FragColor.a = uOpacity;
    }
  `

  uniforms.uOpacity = { value: opacity }
  uniforms.uLightPosition = { value: lightPosition }
  uniforms.uFlatShading = { value: flatShading }
  
  return new RawShaderMaterial({
    ...props,
    uniforms,
    vertexShader,
    fragmentShader,
  })
}
