// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useState } from 'react'
// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import * as THREE from 'three'
import { useEffects, timer } from '../react'

export const DebugCube = ({ rotate = true }) => {

  const [hovered, setHover] = useState(false)

  const { ref } = useEffects<THREE.Mesh>(function* (mesh) {
    if (rotate) {
      yield timer.onFrame(({ deltaTime }) => {
        mesh.rotation.x += 1 * deltaTime
        mesh.rotation.y += 1 * deltaTime
      })
    }
  }, [])

  return (
    <>
      <ambientLight intensity={.5} />
      <directionalLight position={[5, 10, 3]} castShadow />

      <mesh 
        ref={ref} 
        castShadow 
        receiveShadow 
        position-y={1}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry />
        <meshPhysicalMaterial color={hovered ? 'cyan' : 'red'} reflectivity={1} roughness={.1}/>
      </mesh>

      <mesh>
        <sphereGeometry args={[.1]}/>
        <meshPhysicalMaterial color='cyan' reflectivity={1} roughness={.1}/>
      </mesh>

      <mesh rotation-x={Math.PI / 2 } receiveShadow>
        <circleGeometry args={[3]} />
        <shadowMaterial opacity={.33}/>
      </mesh>
    </>
  )
}