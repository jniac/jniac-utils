import { BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, RawShaderMaterial } from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { getGeometryTransformer } from './transform-geometry'

/**
 * Create axes geometry: 3 arrow X, Y, Z with vertex colors.
 */
export const createAxesGeometry = ({
  red = '#f33',
  green = '#3c6',
  blue = '#36f',
  radius = .005,
} = {}) => {

  const { transform } = getGeometryTransformer()

  const setColor = (geometry: BufferGeometry, { r, g, b }: Color) => {
    const count = geometry.attributes.position.count
    const color = new BufferAttribute(new Float32Array(count * 3), 3)
    for (let i = 0; i < count; i++) {
      color.setXYZ(i, r, g, b)
    }
    geometry.setAttribute('color', color)
  }

  const r = new Color(red)
  const g = new Color(green)
  const b = new Color(blue)

  const cone1 = new ConeGeometry(radius * 3, radius * 8)
  const cyl1 = new CylinderGeometry(radius, radius, 1)
  const cone2 = cone1.clone()
  const cyl2 = cyl1.clone()
  const cone3 = cone1.clone()
  const cyl3 = cyl1.clone()

  transform(cone1, { x: 1, rz: -90 })
  transform(cyl1, { x: .5, rz: -90 })
  setColor(cone1, r)
  setColor(cyl1, r)

  transform(cone2, { y: 1 })
  transform(cyl2, { y: .5 })
  setColor(cone2, g)
  setColor(cyl2, g)

  transform(cone3, { z: 1, rx: 90 })
  transform(cyl3, { z: .5, rx: 90 })
  setColor(cone3, b)
  setColor(cyl3, b)

  return mergeBufferGeometries([
    cone1, cyl1,
    cone2, cyl2,
    cone3, cyl3,
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
