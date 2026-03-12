<script lang="ts" setup>
const { pokemon } = defineProps<{
  pokemon: StoreWrappedItem<'pokemons'>
}>()

const editOpen = ref(false)

const imageLoaded = ref(false)
const imageError = ref(false)

const showFallback = computed(() => !pokemon.sprite || imageError.value)

watch(
  () => pokemon.sprite,
  () => {
    imageLoaded.value = false
    imageError.value = false
  },
)

function onImageLoad() {
  imageLoaded.value = true
}

function onImageError() {
  imageError.value = true
}

async function updatePokemon(newPokemon: Pick<StoreResolvedCollectionItem<'pokemons'>, 'pokemonId' | 'name' | 'sprite'>) {
  await pokemon.$update(newPokemon)

  editOpen.value = false
}

async function deletePokemon() {
  await pokemon.$delete()
}

const ago = useTimeAgo(() => pokemon.updatedAt)
</script>

<template>
  <div
    class="p-2 sm:p-4 flex items-center gap-2 sm:gap-4 hover:bg-elevated/50 sm:flex-col sm:rounded-md"
  >
    <div class="relative size-20 sm:size-42 shrink-0 rounded-md overflow-hidden bg-neutral-900/40">
      <img
        v-if="!showFallback"
        :key="pokemon.sprite"
        :src="pokemon.sprite"
        :alt="pokemon.name"
        class="size-full object-contain transition-opacity duration-500 ease-out"
        :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
        @load="onImageLoad"
        @error="onImageError"
      >

      <div
        v-else
        class="absolute inset-0 flex items-center justify-center rounded-md bg-neutral-800/80 text-neutral-300 font-semibold text-xl"
      >
        ?
      </div>
    </div>

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
      <UModal
        v-model:open="editOpen" title="Change Pokémon"
        :ui="{
          body: 'p-0!',
        }"
      >
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
              @select="updatePokemon"
            />

            <div class="flex items-center justify-end gap-4 p-4">
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
        @click="deletePokemon"
      >
        <span class="max-sm:hidden">Delete</span>
      </UButton>
    </div>
  </div>
</template>
