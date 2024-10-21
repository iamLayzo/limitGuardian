import { Store } from '../types';
import Memcached from 'memcached';

export default class MemcachedStore implements Store {
  private client: Memcached;
  private windowMs: number;

  constructor(client: Memcached, windowMs: number) {
    this.client = client;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    return new Promise((resolve, reject) => {
      this.client.incr(key, 1, (err, totalHits) => {
        if (err) return reject(err);
        
        if (typeof totalHits !== 'number' || totalHits === 0) {
          this.client.set(key, '1', this.windowMs / 1000, (err) => {
            if (err) return reject(err);
            totalHits = 1;
            const resetTime = new Date(Date.now() + this.windowMs);
            resolve({ totalHits, resetTime });
          });
        } else {
          const resetTime = new Date(Date.now() + this.windowMs);
          resolve({ totalHits, resetTime });
        }
      });
    });
  }

  async resetKey(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async decrement(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.decr(key, 1, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
