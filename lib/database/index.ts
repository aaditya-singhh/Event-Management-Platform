// lib/database/index.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cache = global.mongooseCache;

if (!cache) {
  cache = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI as string, {
        dbName: 'evently',
        bufferCommands: false,
      })
      .then((m) => {
        return m;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
