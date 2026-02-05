export type PokemonData = Pick<StoreResolvedCollectionItem<'pokemons'>, 'pokemonId' | 'name' | 'sprite'>

export const usePokemons = defineRstoreModule('pokemons', ({ onResolve }) => {
  const savedPokemons = useLocalStorage<PokemonData[]>('pokemons', [])

  let loadPromise: Promise<void> | null = null

  function getSprite(pokemon: any) {
    return pokemon.pokemonsprites[0]?.sprites?.front_default ?? ''
  }

  async function loadPokemons() {
    if (savedPokemons.value.length > 0)
      return

    if (loadPromise)
      return loadPromise

    loadPromise = (async () => {
      const result = await $fetch('https://graphql.pokeapi.co/v1beta2', {
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
      }) as any

      savedPokemons.value = result.data.pokemons.nodes.map((pokemon: any) => ({
        pokemonId: pokemon.id,
        name: pokemon.name,
        sprite: getSprite(pokemon),
      } as PokemonData))
    })()

    try {
      await loadPromise
    }
    finally {
      loadPromise = null
    }
  }

  onResolve(() => loadPokemons())

  return {
    pokemons: computed(() => savedPokemons.value),
    awaitPokemons: loadPokemons,
  }
})
