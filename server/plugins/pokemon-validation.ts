import type { InferInsertModel } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { pokemons } from '../database/schema'
import {
  fetchPokemonFromApi,
  isPokemonNameMatch,
  normalizePokemonSprite,
} from '../utils/pokemon-api'

type PokemonMutationData = Pick<InferInsertModel<typeof pokemons>, 'pokemonId' | 'name' | 'sprite'>

const globalState = globalThis as typeof globalThis & {
  __pokemonValidationHooksRegistered?: boolean
}

function createValidationError(message: string) {
  return createError({
    statusCode: 400,
    statusMessage: message,
  })
}

function isValidPokemonId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isValidPokemonName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidPokemonSprite(value: unknown): value is string {
  return typeof value === 'string'
}

async function getPersistedPokemon(key: string) {
  return await useDrizzle().query.pokemons.findFirst({
    where: eq(pokemons.id, key),
    columns: {
      pokemonId: true,
      name: true,
      sprite: true,
    },
  })
}

async function resolvePokemonData(body: Record<string, unknown>, key?: string): Promise<PokemonMutationData> {
  const persistedPokemon = key ? await getPersistedPokemon(key) : null

  const pokemonId = body.pokemonId ?? persistedPokemon?.pokemonId
  const name = body.name ?? persistedPokemon?.name
  const sprite = body.sprite ?? persistedPokemon?.sprite

  if (!isValidPokemonId(pokemonId))
    throw createValidationError('`pokemonId` must be a positive integer.')

  if (!isValidPokemonName(name))
    throw createValidationError('`name` must be a non-empty string.')

  if (!isValidPokemonSprite(sprite))
    throw createValidationError('`sprite` must be a string.')

  return {
    pokemonId,
    name,
    sprite,
  }
}

async function validatePokemonData(body: Record<string, unknown>, key?: string) {
  const pokemonData = await resolvePokemonData(body, key)
  const canonicalPokemon = await fetchPokemonFromApi(pokemonData.pokemonId)

  if (!canonicalPokemon)
    throw createValidationError(`Pokemon #${pokemonData.pokemonId} does not exist in PokeAPI.`)

  if (!isPokemonNameMatch(canonicalPokemon.name, pokemonData.name)) {
    throw createValidationError(
      `Pokemon name "${pokemonData.name}" does not match PokeAPI entry "${canonicalPokemon.name}".`,
    )
  }

  if (normalizePokemonSprite(canonicalPokemon.sprites.front_default) !== normalizePokemonSprite(pokemonData.sprite)) {
    throw createValidationError('`sprite` does not match the canonical PokeAPI sprite for this Pokemon.')
  }
}

export default defineNitroPlugin(() => {
  if (globalState.__pokemonValidationHooksRegistered)
    return

  globalState.__pokemonValidationHooksRegistered = true

  hooksForTable(pokemons, {
    'index.post.before': async ({ body }) => {
      if (!body || typeof body !== 'object')
        throw createValidationError('A Pokemon payload is required.')

      await validatePokemonData(body as Record<string, unknown>)
    },
    'item.patch.before': async ({ body, key }) => {
      if (!body || typeof body !== 'object')
        throw createValidationError('A Pokemon payload is required.')

      await validatePokemonData(body as Record<string, unknown>, key)
    },
  })
})
