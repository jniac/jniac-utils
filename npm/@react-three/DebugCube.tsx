// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import * as THREE from 'three'
import { useRefComplexEffects } from 'some-utils/react'
import { time } from 'some-utils/npm/@react-three/TimeHandler'

export const DebugCube = ({ rotate = false }) => {
  const ref = useRefComplexEffects<THREE.Mesh>(function* (mesh) {
    if (rotate) {
      yield time.onChange(({ deltaTime }) => {
        mesh.rotation.x += 1 * deltaTime
        mesh.rotation.y += 1 * deltaTime
      })
    }
  }, [])
  return (
    <>
      <ambientLight intensity={.5} />
      <directionalLight position={[5, 10, 5]} />
      <mesh ref={ref} castShadow receiveShadow position-y={1}>
        <boxGeometry />
        <meshPhysicalMaterial color='red' reflectivity={1} roughness={.1}/>
      </mesh>
      <mesh>
        <sphereGeometry args={[.1]}/>
        <meshPhysicalMaterial color='cyan' reflectivity={1} roughness={.1}/>
      </mesh>
    </>
  )
}