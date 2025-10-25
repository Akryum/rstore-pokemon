import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const pokemons = sqliteTable('pokemons', {
  id: text().primaryKey(),
  pokemonId: integer().notNull(),
  name: text().notNull(),
  sprite: text().notNull(),
  createdAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})
