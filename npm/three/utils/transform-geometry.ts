import { BufferAttribute, BufferGeometry, Euler, Matrix4, Quaternion, Vector3 } from 'three'

export type TransformParams = Partial<{
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  rotationOrder: string
  useDegree: boolean
  sx: number
  sy: number
  sz: number
}>

export const getGeometryTransformer = ({
  defaultRotationOrder = 'XYZ',
  defaultUseDegree = true,
} = {}) => {

  // internal, intermediate values
  const e = new Euler()
  const p = new Vector3()
  const r = new Quaternion()
  const s = new Vector3()
  const m = new Matrix4()

  const setMatrix = ({
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0,
    rotationOrder = defaultRotationOrder,
    useDegree = defaultUseDegree,
    sx = 1,
    sy = 1,
    sz = 1,
  }: TransformParams) => {
    const a = useDegree ? Math.PI / 180 : 1
    r.setFromEuler(e.set(rx * a, ry * a, rz * a, rotationOrder))
    p.set(x, y, z)
    s.set(sx, sy, sz)
    m.identity().compose(p, r, s)
  }

  const transformPosition = (attribute: BufferAttribute) => {
    const max = attribute.count
    for (let i = 0; i < max; i++) {
      p.set(
        attribute.getX(i),
        attribute.getY(i),
        attribute.getZ(i)
      )
      p.applyMatrix4(m)
      attribute.setXYZ(i, p.x, p.y, p.z)
    }
  }

  const transformNormal = (attribute: BufferAttribute) => {
    m.setPosition(0, 0, 0)
    const max = attribute.count
    for (let i = 0; i < max; i++) {
      p.set(
        attribute.getX(i),
        attribute.getY(i),
        attribute.getZ(i)
      )
      p.applyMatrix4(m)
      attribute.setXYZ(i, p.x, p.y, p.z)
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