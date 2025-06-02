import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const playlists = pgTable('playlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const playlistMovies = pgTable('playlist_movies', {
  id: serial('id').primaryKey(),
  playlistId: integer('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  tmdbId: integer('tmdb_id').notNull(),
  movieData: text('movie_data').notNull(), // JSON string of movie data from TMDB
  addedAt: timestamp('added_at').defaultNow().notNull()
})