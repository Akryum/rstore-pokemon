<script lang="ts" setup>
const { pokemon } = defineProps<{
  pokemon: StoreWrappedItem<'pokemons'>
}>()

const editOpen = ref(false)

const ago = useTimeAgo(() => pokemon.updatedAt)
</script>

<template>
  <div
    class="p-2 sm:p-4 flex items-center gap-2 sm:gap-4 hover:bg-elevated/50 sm:flex-col sm:rounded-md"
  >
    <img :key="pokemon.sprite" :src="pokemon.sprite" :alt="pokemon.name" class="size-20 sm:size-42">

    <div class="flex-1 min-w-0 flex flex-col items-stretch sm:text-center">
      <div class="truncate text-lg sm:text-2xl">
        {{ pokemon.name }}
      </div>
      <div class="opacity-30 text-sm">
        Updated {{ ago }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex itmes-center gap-4">
      <UModal v-model:open="editOpen" title="Change Pokémon">
        <UButton
          icon="lucide:pen"
          variant="ghost"
          color="neutral"
        >
          <span class="max-sm:hidden">Change</span>
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
        <span class="max-sm:hidden">Delete</span>
      </UButton>
    </div>
  </div>
</template>
