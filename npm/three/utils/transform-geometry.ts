import { BufferAttribute, BufferGeometry, Euler, EulerOrder, Matrix4, Quaternion, Vector3 } from 'three'

export type TransformParams = Partial<{
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  /** Specify directly the quaternion (instead of using euler rotation). */
  q: Quaternion
  rotationOrder: EulerOrder
  useDegree: boolean
  s: number
  sx: number
  sy: number
  sz: number
}>

export const getGeometryTransformer = ({
  defaultRotationOrder = 'XYZ' as EulerOrder,
  defaultUseDegree = true,
} = {}) => {

  // internal, intermediate values
  const _e = new Euler()
  const _p = new Vector3()
  const _r = new Quaternion()
  const _s = new Vector3()
  const _m = new Matrix4()

  const setMatrix = ({
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0,
    rotationOrder = defaultRotationOrder,
    useDegree = defaultUseDegree,
    q = undefined,
    s = 1,
    sx = 1,
    sy = 1,
    sz = 1,
  }: TransformParams) => {
    const a = useDegree ? Math.PI / 180 : 1
    if (q) {
      _r.copy(q)
    } else {
      _r.setFromEuler(_e.set(rx * a, ry * a, rz * a, rotationOrder as EulerOrder))
    }
    _p.set(x, y, z)
    _s.set(s * sx, s * sy, s * sz)
    _m.identity().compose(_p, _r, _s)
  }

  const transformPosition = (attribute: BufferAttribute) => {
    const max = attribute.count
    for (let i = 0; i < max; i++) {
      _p.set(
        attribute.getX(i),
        attribute.getY(i),
        attribute.getZ(i)
      )
      _p.applyMatrix4(_m)
      attribute.setXYZ(i, _p.x, _p.y, _p.z)
    }
  }

  const transformNormal = (attribute: BufferAttribute) => {
    _m.setPosition(0, 0, 0)
    const max = attribute.count
    for (let i = 0; i < max; i++) {
      _p.set(
        attribute.getX(i),
        attribute.getY(i),
        attribute.getZ(i)
      )
      _p.applyMatrix4(_m)
      attribute.setXYZ(i, _p.x, _p.y, _p.z)
    }
  }

  const transform = (geometry: BufferGeometry, transformParams: TransformParams) => {
    setMatrix(transformParams)
    transformPosition(geometry.attributes.position as BufferAttribute)
    transformNormal(geometry.attributes.normal as BufferAttribute)
    return geometry
  }

  return { transform }
}