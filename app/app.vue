<script lang="ts" setup>
useHead({
  title: 'RStore Pokémon',
})

const store = useStore()

const { data: pokemons } = await store.pokemons.liveQuery(q => q.many({
  params: {
    orderBy: [
      'createdAt.desc',
    ],
  },
}))

const createPokemon = store.pokemons.createForm({
  defaultValues: () => ({
    id: crypto.randomUUID(),
  }),
})

const createOpen = ref(false)

createPokemon.$onSuccess(() => {
  createOpen.value = false
})

const syncAgo = useTimeAgo(() => store.$syncState.lastSyncAt ?? new Date())

const online = useOnline()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <div class="flex flex-col gap-4 sm:p-4">
      <div class="flex sm:items-center gap-2 sm:gap-4 max-sm:flex-col max-sm:p-4">
        <UModal v-model:open="createOpen" title="Add Pokémon">
          <UButton
            icon="lucide:plus"
            class="max-sm:fixed bottom-6 right-6 max-sm:size-14 max-sm:justify-center max-sm:rounded-xl"
          >
            <span class="max-sm:hidden">Add Pokémon</span>
          </UButton>

          <template #body>
            <UForm :state="createPokemon" class="flex flex-col gap-4 h-100" @submit="createPokemon.$submit()">
              <PokemonSelect
                :selected-id="createPokemon.pokemonId"
                @select="Object.assign(createPokemon, $event)"
              />

              <div class="flex items-center justify-end gap-4">
                <UButton
                  color="neutral"
                  variant="subtle"
                  @click="createOpen = false"
                >
                  Cancel
                </UButton>
                <UButton
                  type="submit"
                  icon="lucide:plus"
                  :loading="createPokemon.$loading"
                >
                  Add
                </UButton>
              </div>
            </UForm>
          </template>
        </UModal>

        <ClientOnly>
          <div v-if="store.$syncState.lastSyncAt" class="text-dimmed flex items-center gap-1">
            <UIcon name="lucide:refresh-ccw" />
            Last synced {{ syncAgo }}
          </div>

          <div v-if="!online" class="text-dimmed flex items-center gap-1">
            <UIcon name="lucide:cloud-off" />
            Offline
          </div>
        </ClientOnly>
      </div>

      <div class="sm:grid grid-cols-[repeat(auto-fit,300px)]">
        <PokemonItem
          v-for="pokemon of pokemons"
          :key="pokemon.id"
          :pokemon
        />
      </div>

      <div class="h-42" />
    </div>
  </UApp>
</template>
