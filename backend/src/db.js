import mongoose from 'mongoose';
import { config, requireSetting } from './config.js';

mongoose.set('strictQuery', true);

/**
 * One shared connection per server instance. Serverless functions are reused
 * between requests, so the promise is cached on globalThis to avoid opening a new
 * Atlas connection for every request.
 */
const cache = globalThis.__rmcMongo || (globalThis.__rmcMongo = { promise: null });

export function connectDb() {
  requireSetting('MONGODB_URI');
  if (!cache.promise) {
    cache.promise = mongoose.connect(config.mongoUri, {
      dbName: config.mongoDb,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    }).catch((err) => {
      cache.promise = null; // allow a retry on the next request
      throw err;
    });
  }
  return cache.promise;
}

export async function disconnectDb() {
  cache.promise = null;
  await mongoose.disconnect();
}
