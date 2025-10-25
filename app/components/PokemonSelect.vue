<script lang="ts" setup>
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const props = defineProps<{
  selectedId?: number
}>()

const emit = defineEmits<{
  select: [item: PokemonData]
}>()

type PokemonData = Pick<StoreResolvedCollectionItem<'pokemons'>, 'pokemonId' | 'name' | 'sprite'>

const savedPokemons = useLocalStorage<PokemonData[]>('pokemons', [])

onMounted(async () => {
  if (savedPokemons.value.length === 0) {
    savedPokemons.value = (await $fetch('https://graphql.pokeapi.co/v1beta2', {
      method: 'POST',
      body: {
        query: `query {
          pokemons: pokemon_aggregate {
            nodes {
              id
              name
              pokemonsprites {
                sprites
              }
            }
          }
        }`,
      },
    }) as any).data.pokemons.nodes.map((pokemon: any) => ({
      pokemonId: pokemon.id,
      name: pokemon.name,
      sprite: getSprite(pokemon),
    } as PokemonData))
  }
})

function getSprite(pokemon: any) {
  return pokemon.pokemonsprites[0]?.sprites?.front_default ?? ''
}

const items = computed(() => {
  return savedPokemons.value.map(pokemon => ({
    label: pokemon.name,
    avatar: { src: pokemon.sprite },
    active: props.selectedId === pokemon.pokemonId,
    onSelect: () => emit('select', pokemon),
  } satisfies CommandPaletteItem)) || []
})

const groups = computed(() => [
  {
    id: 'pokemons',
    label: 'Pokémons',
    items: items.value,
  } satisfies CommandPaletteGroup,
])
</script>

<template>
  <UCommandPalette
    :model-value="selectedId"
    :groups
    class="flex-1 h-40"
  />
</template>
