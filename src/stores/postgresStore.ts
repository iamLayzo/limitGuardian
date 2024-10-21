import { Pool } from 'pg';
import { Store, RateLimitInfo } from '../types';

export default class PostgreSQLStore implements Store {
  private pool: Pool;
  private windowMs: number;

  constructor(pool: Pool, windowMs: number) {
    this.pool = pool;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const result = await this.pool.query(
      `INSERT INTO rate_limits (key, total_hits, reset_time)
      VALUES ($1, 1, NOW() + interval '${this.windowMs} milliseconds')
      ON CONFLICT (key)
      DO UPDATE SET total_hits = rate_limits.total_hits + 1
      RETURNING total_hits, reset_time;`,
      [key]
    );

    const { total_hits: totalHits, reset_time: resetTime } = result.rows[0];
    const remaining = Math.max(100 - totalHits, 0); // Calcula 'remaining' basado en el límite

    return { totalHits, resetTime, remaining, limit: 100 };
  }

  async resetKey(key: string): Promise<void> {
    await this.pool.query('DELETE FROM rate_limits WHERE key = $1;', [key]);
  }

  async decrement(key: string): Promise<void> {
    await this.pool.query(
      `UPDATE rate_limits
      SET total_hits = GREATEST(total_hits - 1, 0)
      WHERE key = $1;`,
      [key]
    );
  }
}
