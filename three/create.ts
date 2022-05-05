// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import * as THREE from 'three'
import { radian } from 'some-utils/math'

export type TransformArg = Partial<{
  positionX: number
  positionY: number
  positionZ: number
  position: THREE.Vector3
  rotationX: number
  rotationY: number
  rotationZ: number
  rotationOrder: string
  rotation: THREE.Euler
  scaleX: number
  scaleY: number
  scaleZ: number
  scaleScalar: number
  scale: THREE.Vector3
  visible: boolean
  parent: THREE.Object3D
}>

export const applyTransform = (target: THREE.Object3D, {
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  position = new THREE.Vector3(positionX, positionY, positionZ),
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  rotationOrder = 'XYZ',
  rotation = new THREE.Euler(radian(rotationX), radian(rotationY), radian(rotationZ), rotationOrder),
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  scaleScalar = 1,
  scale = new THREE.Vector3(scaleX * scaleScalar, scaleY * scaleScalar, scaleZ * scaleScalar),
  visible = true,
  parent,
}: TransformArg) => {
  target.position.copy(position)
  target.rotation.copy(rotation)
  target.scale.copy(scale)
  target.visible = visible
  parent?.add(target)
  return target
}

export type MeshArg = TransformArg & Partial<{
  geometry: THREE.BufferGeometry
  material: THREE.Material
  receiveShadow: boolean
  castShadow: boolean
}>

export const createMesh = ({
  geometry = new THREE.BoxGeometry(1, 1, 1),
  material = new THREE.MeshPhysicalMaterial({ color: 'red' }),
  receiveShadow = false,
  castShadow = false,
  ...props
}: MeshArg) => {
  const mesh = new THREE.Mesh(geometry, material)
  Object.assign(mesh, {
    receiveShadow,
    castShadow,
  })
  return applyTransform(mesh, props)
}