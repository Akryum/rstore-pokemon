<script lang="ts" setup>
useHead({
  title: 'RStore Pokémon',
})

const store = useStore()

const search = ref('')

function escapeLikeValue(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

const { data: pokemons } = await store.pokemons.liveQuery(q => q.many({
  where: search.value ? like('name', `%${escapeLikeValue(search.value)}%`) : undefined,
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

    <div class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4">
      <div class="flex sm:items-center gap-2 sm:gap-4 max-sm:flex-col">
        <UModal
          v-model:open="createOpen" title="Add Pokémon"
          :ui="{
            body: 'p-0!',
          }"
        >
          <UFieldGroup class="max-sm:fixed max-sm:bottom-6 max-sm:right-6 max-sm:z-1">
            <UButton
              icon="lucide:plus"
              class="max-sm:size-14 max-sm:justify-center max-sm:rounded-xl"
            >
              <span class="max-sm:hidden">Add Pokémon</span>
            </UButton>

            <AddRandomPokemonButton
              class="max-sm:size-14 max-sm:justify-center max-sm:rounded-xl"
              @click.stop
            />
          </UFieldGroup>

          <template #body>
            <UForm :state="createPokemon" class="flex flex-col gap-4 h-100" @submit="createPokemon.$submit()">
              <PokemonSelect
                :selected-id="createPokemon.pokemonId"
                @select="Object.assign(createPokemon, $event)"
              />

              <div class="flex items-center justify-end gap-4 p-4">
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

        <UInput
          v-model="search"
          icon="lucide:search"
          placeholder="Search Pokémon"
          class="flex-1 max-w-md"
        />

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

      <PokemonIslandScene :pokemons />

      <div class="grid gap-3 sm:grid-cols-[repeat(auto-fit,300px)] sm:gap-4">
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
