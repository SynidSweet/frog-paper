import { db } from '../src/lib/db/connection.js'
import { users, playlists } from '../src/lib/db/schema.js'
import { eq } from 'drizzle-orm'

const HARDCODED_USER_EMAIL = 'caitlin.royse@me.com'

async function initDatabase() {
  try {
    console.log('Initializing database...')
    
    // Create user if doesn't exist
    const existingUser = await db.select().from(users).where(eq(users.email, HARDCODED_USER_EMAIL)).limit(1)
    
    let user
    if (existingUser.length === 0) {
      console.log('Creating user...')
      user = await db.insert(users).values({
        email: HARDCODED_USER_EMAIL
      }).returning()
      user = user[0]
    } else {
      user = existingUser[0]
    }
    
    console.log('User created/found:', user.email)
    
    // Create default playlists
    const existingPlaylists = await db.select().from(playlists).where(eq(playlists.userId, user.id))
    
    if (existingPlaylists.length === 0) {
      console.log('Creating default playlists...')
      
      const defaultPlaylists = [
        { name: 'Favorites', description: 'My favorite films' },
        { name: 'Cinematography Study', description: 'Films with exceptional cinematography' },
        { name: 'Color References', description: 'Films with interesting color palettes' }
      ]
      
      for (const playlist of defaultPlaylists) {
        await db.insert(playlists).values({
          userId: user.id,
          name: playlist.name,
          description: playlist.description
        })
      }
      
      console.log('Default playlists created')
    }
    
    console.log('Database initialization complete!')
  } catch (error) {
    console.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initDatabase()