import mongoose from "mongoose";

const g = globalThis as any;
const cache = g._mongo || (g._mongo = { conn: null, promise: null });

export async function connect() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");
  cache.promise = cache.promise || mongoose.connect(uri);
  cache.conn = await cache.promise;
  return cache.conn;
}
