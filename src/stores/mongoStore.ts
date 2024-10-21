import { Store, RateLimitInfo } from '../types';
import { MongoClient } from 'mongodb';

export default class MongoStore implements Store {
  private client: MongoClient;
  private collectionName: string;
  private windowMs: number;

  constructor(client: MongoClient, collectionName: string, windowMs: number) {
    this.client = client;
    this.collectionName = collectionName;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const db = this.client.db();
    const collection = db.collection(this.collectionName);

    const record = await collection.findOneAndUpdate(
      { key },
      { $inc: { totalHits: 1 }, $setOnInsert: { resetTime: new Date(Date.now() + this.windowMs) } },
      { upsert: true, returnDocument: 'after' } // Cambiado de returnOriginal a returnDocument
    );

    // Verifica si 'record' o 'record.value' es null
    const totalHits = record?.value?.totalHits ?? 1;
    const resetTime = record?.value?.resetTime ?? new Date(Date.now() + this.windowMs);
    const remaining = Math.max(100 - totalHits, 0); // Calcula remaining

    return { totalHits, resetTime, remaining, limit: 100 };
  }

  async resetKey(key: string): Promise<void> {
    const db = this.client.db();
    const collection = db.collection(this.collectionName);
    await collection.deleteOne({ key });
  }

  async decrement(key: string): Promise<void> {
    const db = this.client.db();
    const collection = db.collection(this.collectionName);
    await collection.updateOne(
      { key },
      { $inc: { totalHits: -1 } }
    );
  }
}
