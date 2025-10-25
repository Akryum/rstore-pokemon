<script lang="ts" setup>
const store = useStore()

const { data: pokemons } = await store.pokemons.liveQuery(q => q.many())

const createPokemon = store.pokemons.createForm({
  defaultValues: () => ({
    id: crypto.randomUUID(),
  }),
})

const createOpen = ref(false)

createPokemon.$onSuccess(() => {
  createOpen.value = false
})

const editOpen = ref(false)

const syncAgo = useTimeAgo(() => store.$syncState.lastSyncAt ?? new Date())

const online = useOnline()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <div class="p-4 flex items-center gap-4">
      <UModal v-model:open="createOpen" title="Add Pokémon">
        <UButton icon="lucide:plus">
          Add Pokémon
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

    <div class="sm:grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
      <div
        v-for="pokemon of pokemons.toReversed()"
        :key="pokemon.id"
        class="p-4 flex items-center gap-4 hover:bg-elevated/50 sm:flex-col sm:rounded-md"
      >
        <img :src="pokemon.sprite" class="size-20 sm:size-42">
        <span class="flex-1 truncate text-lg sm:text-2xl">{{ pokemon.name }}</span>

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
    </div>
  </UApp>
</template>
