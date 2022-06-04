// @ts-ignore (ignore none-existing module, of course if module does not exist this file should not be imported)
import { useState } from 'react'
import * as THREE from 'three'
import { useRefComplexEffects } from 'some-utils/react'
import { time } from 'some-utils/npm/@react-three/TimeHandler'
import { radian } from 'some-utils/math'

export const DebugCube = ({ rotate = false }) => {

  const [hovered, setHover] = useState(false)

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
      <directionalLight position={[5, 10, 3]} castShadow />

      <mesh ref={ref} 
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

      <mesh rotation-x={radian(-90)} receiveShadow>
        <circleGeometry args={[3]} />
        <meshPhysicalMaterial color='#fc0'/>
      </mesh>
    </>
  )
}