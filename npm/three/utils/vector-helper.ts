import { ConeGeometry, CylinderGeometry, Quaternion, Vector3 } from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { ColorArg, getColor } from './helper-config'
import { getGeometryTransformer } from './transform-geometry'
import { setVertexColor } from './vertex-color'

export const getVectorHelper = ({
  radius = .01,
  radiusScale = 1,
} = {}) => {

  radius *= radiusScale

  const { transform } = getGeometryTransformer()
  const coneHeight = radius * 8
  const sources = {
    cone: new ConeGeometry(radius * 3, coneHeight),
    cyl: new CylinderGeometry(radius, radius, 1),
  }
  
  // Inner, intermediate values.
  const q = new Quaternion()
  const v = new Vector3()

  const getVectorGeometry = (vector: Vector3, {
    origin = new Vector3(0, 0, 0),
    color = 'axis-yellow' as ColorArg,
  } = {}) => {
    const { x, y, z } = origin
    const { x: vx, y: vy, z: vz } = vector
    const vectorLength = vector.length()
    const coneScale = (vectorLength - coneHeight * .5) / vectorLength
    const cylScale = (vectorLength - coneHeight) / vectorLength
    const vectorNormalized = vector.clone().divideScalar(vectorLength)
    q.setFromUnitVectors(v.set(0, 1, 0), vectorNormalized)
    const cone = transform(sources.cone.clone(), { 
      x: x + vx * coneScale, 
      y: y + vy * coneScale, 
      z: z + vz * coneScale,
      q,
    })
    const cyl = transform(sources.cyl.clone(), {
      x: x + vx * cylScale * .5, 
      y: y + vy * cylScale * .5, 
      z: z + vz * cylScale * .5,
      sy: vectorLength * cylScale,
      q,
    })
    const rgb = getColor(color)
    setVertexColor(cone, rgb)
    setVertexColor(cyl, rgb)
    return mergeBufferGeometries([cone, cyl], false)
  }
  
  return { getVectorGeometry }
}
