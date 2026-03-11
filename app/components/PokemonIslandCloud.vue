<script lang="ts" setup>
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const cloudTime = ref(0)

const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    cloudTime.value = timestamp / 1000
  },
  {
    immediate: false,
  },
)

watch(
  prefersReducedMotion,
  (reduced) => {
    if (reduced) {
      pause()
      return
    }

    resume()
  },
  { immediate: true },
)

onUnmounted(() => pause())

const animatedCloudPosition = computed<[number, number, number]>(() => {
  const time = prefersReducedMotion.value ? 0 : cloudTime.value

  return [
    -4.6 + Math.sin(time * 0.16) * 3.9,
    6.25 + Math.sin(time * 0.34) * 0.16,
    -1.7 + Math.cos(time * 0.19) * 0.55,
  ]
})
</script>

<template>
  <!-- Puffy cloud group that slowly drifts above the island. -->
  <TresGroup :position="animatedCloudPosition">
    <TresMesh :position="[-1.05, 0.02, 0]" :scale="[1.35, 0.78, 0.92]">
      <TresSphereGeometry :args="[0.72, 24, 24]" />
      <TresMeshStandardMaterial color="#ffffff" :roughness="0.92" transparent />
    </TresMesh>

    <TresMesh :position="[-0.15, 0.18, 0.12]" :scale="[1.55, 0.92, 1.02]">
      <TresSphereGeometry :args="[0.82, 24, 24]" />
      <TresMeshStandardMaterial color="#ffffff" :roughness="0.92" transparent />
    </TresMesh>

    <TresMesh :position="[0.88, 0, -0.06]" :scale="[1.28, 0.72, 0.9]">
      <TresSphereGeometry :args="[0.7, 24, 24]" />
      <TresMeshStandardMaterial color="#f8fdff" :roughness="0.92" transparent />
    </TresMesh>
  </TresGroup>
</template>
