<script lang="ts" setup>
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

const props = defineProps<{
  selectedId?: number
}>()

const emit = defineEmits<{
  select: [item: PokemonData]
}>()

const { pokemons } = await usePokemons()

const items = computed(() => {
  return pokemons.value.map(pokemon => ({
    label: pokemon.name,
    avatar: { src: pokemon.sprite },
    active: props.selectedId === pokemon.pokemonId,
    onSelect: () => emit('select', pokemon),
  } satisfies CommandPaletteItem)) || []
})

const groups = computed(() => [
  {
    id: 'pokemons',
    // label: 'Pokémons',
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
