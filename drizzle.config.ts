import process from 'node:process'
import { defineConfig } from 'drizzle-kit'

const dbFile = process.env.DB_FILE ?? '.db.sqlite'

export default defineConfig({
  out: './server/database/migrations',
  schema: './server/database/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${dbFile}`,
  },
})
