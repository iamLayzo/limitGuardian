import { Store, RateLimitInfo } from '../types';
import { createClient, RedisClientType } from 'redis';

export default class RedisStore implements Store {
  private client: RedisClientType;
  private windowMs: number;
  private prefix: string;
  private limit: number;  // Hacemos configurable el límite

  constructor(windowMs: number, limit = 100, prefix = 'rl:') {
    this.client = createClient();
    this.windowMs = windowMs;
    this.prefix = prefix;
    this.limit = limit;
    
    // Establecer la conexión asincrónicamente
    this.connectClient();
  }

  // Conexión asíncrona con manejo de errores
  private async connectClient() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
  }

  private prefixKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    try {
      const totalHits = await this.client.incr(this.prefixKey(key));
      if (totalHits === 1) {
        await this.client.expire(this.prefixKey(key), this.windowMs / 1000);
      }
      const resetTime = new Date(Date.now() + this.windowMs);
      const remaining = Math.max(this.limit - totalHits, 0);
      
      // Asegúrate de devolver totalHits en la respuesta
      return { limit: this.limit, remaining, resetTime, totalHits };
    } catch (error) {
      console.error('Error incrementing key in Redis:', error);
      throw error;
    }
  }
  

  async decrement(key: string): Promise<void> {
    try {
      await this.client.decr(this.prefixKey(key));
    } catch (error) {
      console.error('Error decrementing key in Redis:', error);
      throw error;
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await this.client.del(this.prefixKey(key));
    } catch (error) {
      console.error('Error resetting key in Redis:', error);
      throw error;
    }
  }
}
