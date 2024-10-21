/**
 * Interface that all rate limiter stores should implement.
 */
export interface Store {
  /**
   * Method to increment the hit counter for a given key.
   * @param key {string} - The identifier for the client (usually IP).
   */
  increment(key: string): Promise<{ totalHits: number; resetTime?: Date }>; // Aquí devolvemos el total de hits y el tiempo de reinicio

  /**
   * Method to decrement the hit counter for a given key.
   * @param key {string} - The identifier for the client.
   */
  decrement(key: string): Promise<void>;

  /**
   * Method to reset the hit counter for a specific client.
   * @param key {string} - The identifier for the client.
   */
  resetKey(key: string): Promise<void>;

  /**
   * Optionally, method to reset all hit counters.
   */
  resetAll?(): Promise<void>;

  /**
   * Optional method to initialize the store with any necessary configurations.
   * @param options {any} - Options passed to the rate limiter.
   */
  init?(options: any): void;
}

/**
* Options for the rate limiter.
*/
export interface RateLimitOptions {
  windowMs?: number;
  limit?: number;
  legacyHeaders?: boolean;
  standardHeaders?: 'draft-6' | 'draft-8'; 
  skip?: (req: Request) => Promise<boolean> | boolean; // Optional skip function
  skipFailedRequests?: boolean; // Optionally skip failed requests
  skipSuccessfulRequests?: boolean; // Optionally skip successful requests
  store: Store; // The store type should refer to our Store interface.
}

/**
* Rate limit information that will be used in headers and response.
*/
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime?: Date;
  totalHits: number; // Añadido para cumplir con el contrato de la interfaz Store
}
