# rstore Pokemon

`rstore-pokemon` is a small Nuxt 4 demo built to teach `rstore` through a real app.
It is meant to be easy to read, easy to run, and useful as an educative resource on TiHub or GitHub.

The idea is simple: a Drizzle table becomes an `rstore` collection, and the UI uses that collection to query, create, update, delete, sync, and cache Pokemon without hand-writing a full CRUD layer.

## What's in this repo

- How `@rstore/nuxt-drizzle` turns a Drizzle schema into a client collection
- How to read data with `store.pokemons.liveQuery(...)`
- How to create records with `store.pokemons.createForm(...)`
- How to update and delete through wrapped items like `pokemon.$update()` and `pokemon.$delete()`
- How to group reusable logic with `defineRstoreModule(...)`
- How realtime + offline support fit into a Nuxt app

## Stack

- Nuxt 4
- `@rstore/nuxt-drizzle`
- `@rstore/vue`
- Drizzle ORM
- SQLite via libSQL
- Nuxt UI
- TresJS for the 3D island scene

## Quick start

This project uses `pnpm`.

```bash
pnpm install
pnpm db:push
pnpm dev
```

Then open `http://localhost:3000`.

Notes:

- `pnpm db:push` creates the local SQLite database from `server/database/schema.ts`.
- If you change the schema, run `pnpm db:push` again.
- The database file lives at `.db.sqlite` in the project root.
- The Pokemon catalog used by the picker is fetched from PokeAPI on demand and cached in browser local storage.
- The Pokemon you add to the island are stored through `rstore` + Drizzle in SQLite.

## Why this is a good first `rstore` project

This repo stays small on purpose. There is only one persisted collection, so the `rstore` pieces are easy to spot:

- schema definition
- generated collection
- reactive query
- create form
- item updates and deletes
- optimistic mutation
- sync state in the UI

It also shows an important boundary for new users: not every piece of state has to live in `rstore`.
The saved island Pokemon are `rstore` data.
The full Pokemon catalog used for selection is just a local helper module backed by `useLocalStorage`.

## How the data flow works

1. `server/database/schema.ts` defines the `pokemons` table.
2. `@rstore/nuxt-drizzle` reads that schema and generates the `pokemons` collection plus the server CRUD layer.
3. `server/utils/drizzle.ts` provides the Drizzle instance used by the generated handlers.
4. `useStore()` exposes `store.pokemons` on the client.
5. The app uses `liveQuery`, forms, and wrapped items to interact with the collection.
6. `rstore` handles cache updates, sync metadata, offline support, and websocket-driven freshness.

This demo enables both websocket sync and offline support in `nuxt.config.ts`:

```ts
rstoreDrizzle: {
  ws: true,
  offline: true,
},
```

The app also runs with `ssr: false` to keep the example focused on client-side store behavior.
That is a demo choice, not a requirement of `rstore`.

## Read the code in this order

| File | Why it matters |
| --- | --- |
| `nuxt.config.ts` | Enables `@rstore/nuxt-drizzle`, websocket sync, and offline support |
| `server/database/schema.ts` | Source of truth for the generated `pokemons` collection |
| `server/utils/drizzle.ts` | Exposes `useDrizzle()` for generated server handlers |
| `app/app.vue` | Main example of `liveQuery`, `createForm`, search, and sync state |
| `app/components/PokemonItem.vue` | Shows item-level mutations with `$update()` and `$delete()` |
| `app/composables/randomPokemon.ts` | Demonstrates `defineRstoreModule(...)` and optimistic create |
| `app/composables/pokemons.ts` | Shows a non-`rstore` helper module for the Pokemon catalog |

## Key `rstore` patterns shown here

### 1. Reactive collection reads

The main screen loads Pokemon with a `liveQuery`:

```ts
const { data: pokemons } = await store.pokemons.liveQuery(q => q.many({
  where: search.value ? like('name', `%${escapeLikeValue(search.value)}%`) : undefined,
  params: {
    orderBy: ['createdAt.desc'],
  },
}))
```

This is a good first example because it combines:

- a generated collection (`store.pokemons`)
- a reactive filter (`search`)
- a server-backed query
- a list that stays connected to `rstore` state

### 2. Create flows with forms

The add modal uses `createForm(...)` instead of manually juggling loading and mutation state:

```ts
const createPokemon = store.pokemons.createForm({
  defaultValues: () => ({
    id: crypto.randomUUID(),
  }),
})
```

That form object is then bound directly to the UI and submitted with `createPokemon.$submit()`.

### 3. Wrapped items for updates and deletes

`PokemonItem.vue` receives a `StoreWrappedItem<'pokemons'>`.
That means each row already knows how to mutate itself:

```ts
await pokemon.$update(newPokemon)
await pokemon.$delete()
```

This is one of the nicest parts of `rstore` for newcomers: once you have a wrapped item, the read/write API stays close to the data you are rendering.

### 4. Reusable store logic with modules

`app/composables/randomPokemon.ts` puts mutation logic in a module instead of a component:

```ts
const addRandomPokemon = defineMutation(async () => {
  await store.pokemons.create({
    id: crypto.randomUUID(),
    pokemonId: pokemon.pokemonId,
    name: pokemon.name,
    sprite: pokemon.sprite,
  }, {
    optimistic: true,
  })
})
```

That keeps the UI small and makes the mutation reusable.

## What is generated vs hand-written

Generated by `@rstore/nuxt-drizzle`:

- the client collection exposed as `store.pokemons`
- the CRUD API for that collection
- websocket integration for collection updates
- offline sync plumbing

Hand-written in this repo:

- the Drizzle schema
- the Drizzle connection helper
- the UI queries and forms
- the reusable modules
- the 3D presentation layer

If you are new to `rstore`, this distinction is worth keeping in mind: you describe your data model once, then spend most of your time writing app logic instead of repetitive transport code.

## Good exercises after you understand the demo

- Add a `favorite` boolean field to the `pokemons` table and expose it in the UI
- Add a second collection such as `trainers`
- Create a relation between `trainers` and `pokemons`
- Add a filtered view that only shows favorites
- Replace the search with pagination or infinite scrolling
- Add table access rules with `hooksForTable(...)`

## Learn more

- `rstore` docs: <https://rstore.akryum.dev>
- Vue getting started: <https://rstore.akryum.dev/guide/getting-started#vue>
- Nuxt Drizzle plugin: <https://rstore.akryum.dev/plugins/nuxt-drizzle>
- Query guide: <https://rstore.akryum.dev/guide/data/query>
- Form guide: <https://rstore.akryum.dev/guide/data/form>
- Live query and realtime guide: <https://rstore.akryum.dev/guide/data/live>
