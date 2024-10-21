import { Store, RateLimitInfo } from '../types';

export default class MemoryStore implements Store {
  private hits: Map<string, RateLimitInfo> = new Map();
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    let clientInfo = this.hits.get(key);

    if (!clientInfo) {
      clientInfo = { limit: 100, remaining: 99, resetTime: new Date(Date.now() + this.windowMs), totalHits: 1 };
      this.hits.set(key, clientInfo);
    } else {
      clientInfo.totalHits++;
      clientInfo.remaining = Math.max(clientInfo.limit - clientInfo.totalHits, 0);
    }

    return clientInfo;
  }

  async decrement(key: string): Promise<void> {
    const clientInfo = this.hits.get(key);
    if (clientInfo) {
      clientInfo.totalHits--;
      clientInfo.remaining = Math.min(clientInfo.remaining + 1, clientInfo.limit);
    }
  }

  async resetKey(key: string): Promise<void> {
    this.hits.delete(key);
  }

  async resetAll(): Promise<void> {
    this.hits.clear();
  }
}
