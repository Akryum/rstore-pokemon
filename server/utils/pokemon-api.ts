import { createError } from 'h3'

interface PokemonApiResponse {
  id: number
  name: string
  sprites: {
    front_default: string | null
  }
}

const pokemonCache = new Map<string, Promise<PokemonApiResponse | null>>()

function normalizePokemonName(value: string) {
  return value.trim().toLowerCase()
}

function getCacheKey(identifier: number | string) {
  return typeof identifier === 'number'
    ? `id:${identifier}`
    : `name:${normalizePokemonName(identifier)}`
}

export function normalizePokemonSprite(value: string | null | undefined) {
  return value ?? ''
}

export async function fetchPokemonFromApi(identifier: number | string) {
  const cacheKey = getCacheKey(identifier)

  let request = pokemonCache.get(cacheKey)
  if (!request) {
    request = $fetch<PokemonApiResponse>(
      `https://pokeapi.co/api/v2/pokemon/${typeof identifier === 'number' ? identifier : normalizePokemonName(identifier)}`,
    )
      .catch((error: any) => {
        if (error?.status === 404 || error?.response?.status === 404)
          return null

        throw createError({
          statusCode: 503,
          statusMessage: 'Pokemon API validation failed',
          data: {
            cause: error instanceof Error ? error.message : String(error),
          },
        })
      })

    pokemonCache.set(cacheKey, request)
  }

  const pokemon = await request

  if (pokemon) {
    pokemonCache.set(`id:${pokemon.id}`, Promise.resolve(pokemon))
    pokemonCache.set(`name:${normalizePokemonName(pokemon.name)}`, Promise.resolve(pokemon))
  }

  return pokemon
}

export function isPokemonNameMatch(actualName: string, expectedName: string) {
  return normalizePokemonName(actualName) === normalizePokemonName(expectedName)
}
