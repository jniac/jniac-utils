import { ConeGeometry, CylinderGeometry, RawShaderMaterial } from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { ColorArg, helperConfig, getColor } from './helper-config'
import { setVertexColor } from './vertex-color'
import { getGeometryTransformer } from './transform-geometry'

/**
 * Create axes geometry: 3 arrow X, Y, Z with vertex colors.
 */
export const createAxesGeometry = ({
  colorX = 'axis-x' as ColorArg,
  colorY = 'axis-y' as ColorArg,
  colorZ = 'axis-z' as ColorArg,
  radius = helperConfig['axis-radius'],
  radiusScale = 1,
} = {}) => {

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

  const coneDistance = 1 - coneHeight * .5
  const cylLength = 1 - coneHeight
  transform(cone1, { x: coneDistance, rz: -90 })
  transform(cyl1, { x: cylLength * .5, sy: cylLength, rz: -90 })
  setVertexColor(cone1, _colorX)
  setVertexColor(cyl1, _colorX)

  transform(cone2, { y: coneDistance })
  transform(cyl2, { y: cylLength * .5, sy: cylLength })
  setVertexColor(cone2, _colorY)
  setVertexColor(cyl2, _colorY)

  transform(cone3, { z: coneDistance, rx: 90 })
  transform(cyl3, { z: cylLength * .5, sy: cylLength, rx: 90 })
  setVertexColor(cone3, _colorZ)
  setVertexColor(cyl3, _colorZ)

  return mergeBufferGeometries([
    cyl1, cone1,
    cyl2, cone2,
    cyl3, cone3,
  ], false)
}



// heavily inspired by https://github.com/oframe/ogl/blob/master/examples/base-primitives.html
export const createAxesMaterial = () => {
  
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
    #define light normalize(vec3(0.3, 0.8, 0.6))
    varying vec3 vNormal, vColor;
    void main() {
      float lighting = dot(vNormal, light);
      gl_FragColor.rgb = vColor + lighting * 0.3;
      gl_FragColor.a = 1.0;
    }
  `
  
  return new RawShaderMaterial({
    vertexShader,
    fragmentShader,
  })
}
