import { Repository } from 'typeorm';
import { Store, RateLimitInfo } from '../types';

export default class TypeOrmStore implements Store {
  private repo: Repository<any>;
  private windowMs: number;

  constructor(repo: Repository<any>, windowMs: number) {
    this.repo = repo;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const record = await this.repo.findOne({ where: { key } });

    let totalHits = 1;
    let resetTime = new Date(Date.now() + this.windowMs);

    if (record) {
      record.totalHits += 1;
      totalHits = record.totalHits;
      resetTime = record.resetTime;
      await this.repo.save(record);
    } else {
      await this.repo.save({ key, totalHits, resetTime });
    }

    const remaining = Math.max(100 - totalHits, 0);
    return { totalHits, limit: 100, remaining, resetTime };
  }

  async decrement(key: string): Promise<void> {
    const record = await this.repo.findOne({ where: { key } });
    if (record && record.totalHits > 0) {
      record.totalHits -= 1;
      await this.repo.save(record);
    }
  }

  async resetKey(key: string): Promise<void> {
    await this.repo.delete({ key });
  }
}
