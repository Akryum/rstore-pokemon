export const useRandomPokemon = defineRstoreModule('randomPokemon', ({ defineMutation }) => {
  const toast = useToast()
  const store = useStore()

  const { pokemons, awaitPokemons } = usePokemons()

  const addRandomPokemon = defineMutation(async () => {
    try {
      await awaitPokemons()

      const available = pokemons.value
      if (available.length === 0) {
        toast.add({
          title: 'No Pokemon available',
          color: 'error',
          icon: 'lucide:alert-triangle',
        })
        return
      }

      const pokemon = available[Math.floor(Math.random() * available.length)]!

      await store.pokemons.create({
        id: crypto.randomUUID(),
        pokemonId: pokemon.pokemonId,
        name: pokemon.name,
        sprite: pokemon.sprite,
      }, {
        optimistic: true,
      })

      toast.add({
        title: 'Pokemon added',
        description: pokemon.name,
        icon: 'lucide:check',
      })
    }
    catch (error) {
      console.error(error)
      toast.add({
        title: 'Failed to add Pokemon',
        description: error instanceof Error ? error.message : String(error),
        color: 'error',
        icon: 'lucide:alert-triangle',
      })
    }
  })

  return {
    addRandomPokemon,
  }
})
