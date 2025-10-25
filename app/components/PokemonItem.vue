<script lang="ts" setup>
const { pokemon } = defineProps<{
  pokemon: StoreWrappedItem<'pokemons'>
}>()

const editOpen = ref(false)
</script>

<template>
  <div
    class="p-4 flex items-center gap-4 hover:bg-elevated/50 sm:flex-col sm:rounded-md"
  >
    <img :key="pokemon.sprite" :src="pokemon.sprite" :alt="pokemon.name" class="size-20 sm:size-42">
    <span class="flex-1 truncate text-lg sm:text-2xl">{{ pokemon.name }}</span>
    <span class="w-full break-all">{{ pokemon.sprite }}</span>

    <!-- Actions -->
    <div class="flex itmes-center gap-4">
      <UModal v-model:open="editOpen" title="Change Pokémon">
        <UButton
          icon="lucide:pen"
          variant="ghost"
          color="neutral"
        >
          Change
        </UButton>

        <template #body>
          <div class="flex flex-col gap-4 h-100">
            <PokemonSelect
              :selected-id="pokemon.pokemonId"
              @select="pokemon.$update($event); editOpen = false"
            />

            <div class="flex items-center justify-end gap-4">
              <UButton
                color="neutral"
                variant="subtle"
                @click="editOpen = false"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </template>
      </UModal>

      <UButton
        color="error"
        variant="ghost"
        icon="lucide:trash"
        @click="pokemon.$delete()"
      >
        Delete
      </UButton>
    </div>
  </div>
</template>
