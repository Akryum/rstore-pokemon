<script lang="ts" setup>
import { useTexture } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import { DoubleSide, NearestFilter, SRGBColorSpace, Vector3 } from 'three'

type ScenePokemon = Pick<StoreResolvedCollectionItem<'pokemons'>, 'id' | 'pokemonId' | 'name' | 'sprite'>

const props = withDefaults(defineProps<{
  pokemon: ScenePokemon
  index: number
  paused?: boolean
}>(), {
  paused: false,
})

function hashSeed(value: string) {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

const seed = hashSeed(`${props.pokemon.id}:${props.pokemon.pokemonId}:${props.pokemon.name}`)
const lane = props.index % 4
const basePhase = (seed % 360) * (Math.PI / 180)
const homeAngle = ((seed >> 2) % 360) * (Math.PI / 180)
const islandRadiusX = 5.8
const islandRadiusZ = 4.9
const homeRadius = 2.4 + lane * 0.65 + ((seed >> 4) % 4) * 0.3
const homeX = Math.cos(homeAngle) * homeRadius
const homeZ = Math.sin(homeAngle) * homeRadius * 0.82
const driftSpeedA = 0.18 + (seed % 5) * 0.025
const driftSpeedB = 0.11 + ((seed >> 3) % 5) * 0.018
const driftSpeedC = 0.26 + ((seed >> 5) % 6) * 0.02
const wanderRadiusX = 2.25 + lane * 0.55 + ((seed >> 7) % 5) * 0.22
const wanderRadiusZ = 1.65 + lane * 0.35 + ((seed >> 9) % 5) * 0.18
const hoverHeight = 1.7
const spriteScale = 1.35 + ((seed >> 7) % 6) * 0.06

const position = shallowRef<[number, number, number]>([homeX, hoverHeight, homeZ])
const scale = shallowRef<[number, number, number]>([spriteScale, spriteScale, spriteScale])
const shadowScale = shallowRef<[number, number, number]>([1, 0.55, 1])
const shadowOpacity = ref(0.22)
const spriteFlip = ref<1 | -1>(1)

const previousPosition = new Vector3(homeX, hoverHeight, homeZ)
const currentPosition = new Vector3(homeX, hoverHeight, homeZ)
const movement = new Vector3()
const cameraRight = new Vector3()

const textureSource = computed(() => props.pokemon.sprite || '/favicon.ico')
const { state: texture } = useTexture(textureSource)

watch(
  texture,
  (value) => {
    if (!value)
      return

    value.colorSpace = SRGBColorSpace
    value.magFilter = NearestFilter
    value.minFilter = NearestFilter
    value.generateMipmaps = false
    value.needsUpdate = true
  },
  { immediate: true },
)

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed, camera }) => {
  const time = props.paused ? 0 : elapsed
  const offsetX
    = Math.sin(time * driftSpeedA + basePhase) * wanderRadiusX
      + Math.cos(time * driftSpeedB + basePhase * 1.7) * wanderRadiusX * 0.48
      + Math.sin(time * driftSpeedC + basePhase * 0.65) * wanderRadiusX * 0.2
  const offsetZ
    = Math.cos(time * (driftSpeedA * 0.92) + basePhase * 1.3) * wanderRadiusZ
      + Math.sin(time * (driftSpeedB * 1.15) + basePhase * 0.8) * wanderRadiusZ * 0.52
      + Math.cos(time * (driftSpeedC * 0.7) + basePhase * 1.9) * wanderRadiusZ * 0.18
  let x = homeX + offsetX
  let z = homeZ + offsetZ
  const edgeFactor = (x * x) / (islandRadiusX * islandRadiusX) + (z * z) / (islandRadiusZ * islandRadiusZ)
  if (edgeFactor > 1) {
    const clampFactor = 1 / Math.sqrt(edgeFactor)
    x *= clampFactor
    z *= clampFactor
  }

  const depth = (z + islandRadiusZ) / (islandRadiusZ * 2)
  const bob = Math.sin(time * (driftSpeedC * 8) + basePhase) * 0.06
  const currentScale = spriteScale * (0.82 + depth * 0.42)
  const y = hoverHeight + bob

  currentPosition.set(x, y, z)
  movement.subVectors(currentPosition, previousPosition)

  const activeCamera = camera.value
  if (activeCamera && movement.lengthSq() > 0.0001) {
    cameraRight.setFromMatrixColumn(activeCamera.matrixWorld, 0).normalize()
    const movementRight = movement.x * cameraRight.x + movement.z * cameraRight.z

    if (Math.abs(movementRight) > 0.0001)
      spriteFlip.value = movementRight > 0 ? -1 : 1
  }

  position.value = [x, y, z]
  scale.value = [currentScale * spriteFlip.value, currentScale, currentScale]

  const shadowSize = 0.78 + depth * 0.34
  shadowScale.value = [shadowSize, 0.45 + depth * 0.18, shadowSize]
  shadowOpacity.value = 0.14 + depth * 0.14

  previousPosition.copy(currentPosition)
})
</script>

<template>
  <TresGroup :position="position">
    <!-- Flat circle mesh used as the Pokemon's ground shadow. -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -0.75, 0]" :scale="shadowScale">
      <TresCircleGeometry :args="[0.82, 24]" />
      <TresMeshBasicMaterial color="#0f172a" :transparent="true" :opacity="shadowOpacity" />
    </TresMesh>

    <!-- Billboard rotates the sprite so it keeps facing the active camera. -->
    <Billboard auto-update>
      <!-- Plane geometry is the 2D card the Pokemon texture is drawn onto. -->
      <TresMesh :scale="scale">
        <TresPlaneGeometry :args="[1.6, 1.6]" />
        <!-- Basic material keeps the sprite unlit and preserves transparency. -->
        <TresMeshBasicMaterial
          :map="texture || undefined"
          color="#ffffff"
          :transparent="true"
          :alpha-test="0.18"
          :tone-mapped="false"
          :side="DoubleSide"
        />
      </TresMesh>
    </Billboard>
  </TresGroup>
</template>
