<script lang="ts" setup>
import type { CommandPaletteItem } from '@nuxt/ui'

const props = defineProps<{
  selectedId?: number
}>()

const emit = defineEmits<{
  select: [item: any]
}>()

const search = ref('')

const debouncedSearch = useDebounce(search, 300)

const { data, status } = useFetch<any>('https://graphql.pokeapi.co/v1beta2', {
  method: 'POST',
  body: computed(() => ({
    query: `query ($search: String!) {
  pokemons: pokemon_aggregate(where: {name: {_iregex: $search}}, limit: 10) {
    nodes {
      id
      name
      pokemonsprites {
        sprites
      }
    }
  }
}`,
    variables: {
      search: debouncedSearch.value,
    },
  })),
})

function getSprite(pokemon: any) {
  return pokemon.pokemonsprites[0]?.sprites?.front_default ?? ''
}

const items = computed(() => {
  return data.value?.data?.pokemons.nodes.map((pokemon: any) => ({
    label: pokemon.name,
    avatar: { src: getSprite(pokemon) },
    active: props.selectedId === pokemon.id,
    onSelect: () => emit('select', {
      pokemonId: pokemon.id,
      name: pokemon.name,
      sprite: getSprite(pokemon),
    }),
  } satisfies CommandPaletteItem)) || []
})

const groups = computed(() => [
  {
    id: 'pokemons',
    label: 'Pokémons',
    items: items.value,
  },
])
</script>

<template>
  <UCommandPalette
    v-model:search-term="search"
    :model-value="selectedId"
    :loading="status === 'pending'"
    :groups
    class="flex-1 h-40"
  />
</template>
