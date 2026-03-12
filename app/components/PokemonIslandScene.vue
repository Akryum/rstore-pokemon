<script lang="ts" setup>
import { ACESFilmicToneMapping } from 'three'

type ScenePokemon = Pick<StoreResolvedCollectionItem<'pokemons'>, 'id' | 'pokemonId' | 'name' | 'sprite'>

const props = withDefaults(defineProps<{
  pokemons: ScenePokemon[]
  maxPokemons3d?: number
}>(), {
  maxPokemons3d: 24,
})

const trees = [
  {
    position: [-2.8, 1.35, -1.8] as const,
    canopyScale: [1.2, 1.05, 1.2] as const,
    canopyColor: '#81c95f',
  },
  {
    position: [3.15, 1.35, -0.9] as const,
    canopyScale: [1.05, 0.95, 1.05] as const,
    canopyColor: '#72b851',
  },
  {
    position: [2.1, 1.35, 2.2] as const,
    canopyScale: [0.95, 0.9, 0.95] as const,
    canopyColor: '#8cd06b',
  },
] as const

const rocks = [
  {
    position: [-4.15, 1.34, -0.35] as const,
    scale: [0.72, 0.42, 0.58] as const,
    rotation: [0.12, 0.48, -0.08] as const,
    color: '#94a3b8',
  },
  {
    position: [3.9, 1.32, -1.95] as const,
    scale: [0.5, 0.3, 0.44] as const,
    rotation: [-0.06, -0.28, 0.16] as const,
    color: '#a8b4bf',
  },
  {
    position: [3.25, 1.34, 2.55] as const,
    scale: [0.86, 0.38, 0.62] as const,
    rotation: [0.05, 0.86, -0.12] as const,
    color: '#8f9aa5',
  },
] as const

const visiblePokemons = computed(() => {
  return props.pokemons.slice(0, props.maxPokemons3d)
})

const countLabel = computed(() => {
  const count = props.pokemons.length

  if (count === 0)
    return 'No Pokemon roaming yet'

  if (count === 1)
    return '1 Pokemon roaming the island'

  return `${count} Pokemon roaming the island`
})

const prefersReducedMotion = usePreferredReducedMotion()
</script>

<template>
  <section
    class="relative isolate overflow-hidden rounded-[1.5rem] border border-slate-900/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.3)),linear-gradient(180deg,#bfe4ff_0%,#89c8ff_44%,#4f95dc_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_24px_60px_rgba(61,84,132,0.18)] min-h-[22rem] sm:min-h-[25rem] sm:rounded-[2rem]"
  >
    <div
      class="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.5),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.14),transparent_36%)]"
    />

    <div
      class="absolute top-6 right-8 z-10 aspect-square w-24 rounded-full bg-[radial-gradient(circle,rgba(255,250,210,0.95)_0%,rgba(255,208,106,0.92)_52%,rgba(255,208,106,0)_74%)] blur-[1px]"
    />

    <div class="absolute top-16 left-[14%] z-10 h-[1.7rem] w-[5.5rem] rounded-full bg-white/60 blur-[1px]">
      <div class="absolute left-2 bottom-[0.3rem] size-8 rounded-full bg-white/60" />
      <div class="absolute right-3 bottom-[0.4rem] size-10 rounded-full bg-white/60" />
    </div>

    <div class="absolute top-28 right-[20%] z-10 h-[1.4rem] w-[4.5rem] rounded-full bg-white/50 blur-[1px]">
      <div class="absolute left-[0.3rem] bottom-[0.2rem] size-[1.8rem] rounded-full bg-white/50" />
      <div class="absolute right-[0.6rem] bottom-[0.2rem] size-[1.9rem] rounded-full bg-white/50" />
    </div>

    <header class="absolute top-4 left-4 z-50 max-w-48 sm:top-[1.4rem] sm:left-[1.4rem] sm:max-w-72">
      <p class="mb-[0.35rem] text-[0.78rem] font-bold uppercase tracking-[0.18em] text-slate-900/60">
        Live View
      </p>
      <h2 class="m-0 font-serif text-[clamp(1.9rem,5vw,3rem)] leading-[0.95] text-slate-900">
        Pokemon Island
      </h2>
      <p class="mt-[0.55rem] max-w-56 text-[0.88rem] text-slate-900/70 sm:text-[0.98rem]">
        {{ countLabel }}
      </p>
    </header>

    <TresCanvas
      class="absolute inset-0 z-20"
      clear-color="#000000"
      :clear-alpha="0"
      :tone-mapping="ACESFilmicToneMapping"
      shadows
    >
      <!-- Camera that frames the whole island from above. -->
      <TresPerspectiveCamera
        :position="[0, 8.6, 14.8]"
        :fov="42"
      />

      <!-- Orbit controls let you rotate around the island with pointer input. -->
      <OrbitControls
        make-default
        :target="[0, 1.8, 0]"
        :enable-pan="false"
        :enable-damping="true"
        :min-distance="11"
        :max-distance="20"
        :min-polar-angle="0.8"
        :max-polar-angle="1.34"
      />

      <!-- Broad ambient fill so the scene stays readable from every angle. -->
      <TresAmbientLight color="#fff8e1" :intensity="1.45" />
      <!-- Hemisphere light tints the top and bottom of the scene differently. -->
      <TresHemisphereLight :args="['#f8fdff', '#34618f', 1.15]" />

      <!-- Main directional light acting like the sun and casting shadows. -->
      <TresDirectionalLight
        cast-shadow
        color="#fff3d4"
        :intensity="2.8"
        :position="[10, 16, 7]"
      />

      <!-- Secondary fill light to keep the shaded side from going flat. -->
      <TresDirectionalLight
        color="#9cc8ff"
        :intensity="0.8"
        :position="[-9, 10, -8]"
      />

      <PokemonIslandCloud />

      <!-- Big ocean disc under the island. -->
      <TresMesh receive-shadow :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -1.45, 0]">
        <TresCircleGeometry :args="[14, 64]" />
        <TresMeshStandardMaterial color="#4ea8e8" :roughness="0.26" :metalness="0.04" />
      </TresMesh>

      <!-- Shallow ring around the island to suggest the shoreline glow. -->
      <TresMesh receive-shadow :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -1.1, 0]">
        <TresRingGeometry :args="[7.35, 8.25, 64]" />
        <TresMeshBasicMaterial color="#ffffff" :transparent="true" :opacity="0.74" />
      </TresMesh>

      <!-- The island landmass and all static props live in this group. -->
      <TresGroup :position="[0, -0.62, 0]">
        <!-- Cylinder mesh used as the dirt body of the island. -->
        <TresMesh cast-shadow receive-shadow :position="[0, 0.22, 0]">
          <TresCylinderGeometry :args="[6.7, 7.8, 1.52, 48]" />
          <TresMeshStandardMaterial color="#744927" :roughness="1" />
        </TresMesh>

        <!-- Cylinder that forms the grassy top surface. -->
        <TresMesh cast-shadow receive-shadow :position="[0, 1.14, 0]" :scale="[1.42, 0.208, 1.24]">
          <TresCylinderGeometry :args="[4.9, 5.35, 1.2, 48]" />
          <TresMeshStandardMaterial color="#79c658" :roughness="0.94" />
        </TresMesh>

        <!-- Circular sand patch resting on the grass. -->
        <TresMesh receive-shadow :rotation="[-Math.PI / 2, 0, 0]" :position="[-0.3, 1.34, 0.75]">
          <TresCircleGeometry :args="[2.55, 40]" />
          <TresMeshStandardMaterial color="#ead99c" :roughness="0.96" />
        </TresMesh>

        <!-- Small water pool detail on the island. -->
        <TresMesh receive-shadow :rotation="[-Math.PI / 2, 0, 0]" :position="[-2.35, 1.35, 1.15]" :scale="[1.35, 0.92, 1.1]">
          <TresCircleGeometry :args="[1.05, 40]" />
          <TresMeshStandardMaterial color="#4faae2" :roughness="0.18" :metalness="0.03" />
        </TresMesh>

        <!-- Low-poly rocks add extra environmental detail around the island. -->
        <TresMesh
          v-for="rock in rocks"
          :key="rock.position.join(':')"
          cast-shadow
          receive-shadow
          :position="rock.position"
          :scale="rock.scale"
          :rotation="rock.rotation"
        >
          <TresDodecahedronGeometry :args="[0.7, 0]" />
          <TresMeshStandardMaterial :color="rock.color" :roughness="0.98" />
        </TresMesh>

        <!-- Each decorative tree is a grouped trunk mesh plus canopy mesh. -->
        <TresGroup
          v-for="tree in trees"
          :key="tree.position.join(':')"
          :position="tree.position"
        >
          <TresMesh cast-shadow :position="[0, 0.38, 0]">
            <TresCylinderGeometry :args="[0.13, 0.19, 0.95, 12]" />
            <TresMeshStandardMaterial color="#7c4b2d" :roughness="1" />
          </TresMesh>

          <TresMesh cast-shadow :position="[0, 1.12, 0]" :scale="tree.canopyScale">
            <TresSphereGeometry :args="[0.62, 20, 20]" />
            <TresMeshStandardMaterial :color="tree.canopyColor" :roughness="0.9" />
          </TresMesh>
        </TresGroup>
      </TresGroup>

      <!-- One animated billboard sprite instance per Pokemon. -->
      <PokemonIslandSprite
        v-for="(pokemon, index) in visiblePokemons"
        :key="pokemon.id"
        :pokemon="pokemon"
        :index="index"
        :paused="prefersReducedMotion === 'reduce'"
      />
    </TresCanvas>
  </section>
</template>
