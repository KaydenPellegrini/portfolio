/* lib/db.ts */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'budget';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI missing in .env.local — fix it, Kayden');
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('✅ MongoDB Atlas connected (budget db)');
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Vercel serverless rule: ALWAYS call await connectDB() at top of every Server Action.
// Singleton + global cache = no pool explosion under load. Your existing route.ts + attachDatabasePool still works if you wrap this.