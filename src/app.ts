import express from 'express';
import { rateLimiter } from './core/rateLimiter';
import MemoryStore from './stores/memoryStore';
import { validateRateLimitOptions } from './utils/validations';
import { RateLimitOptions } from './types';

const app = express();

// Define rate limit options using the RateLimitOptions interface
const rateLimitOptions: RateLimitOptions = {
    windowMs: 60000,  // 1 minute
    limit: 5,
    store: new MemoryStore(60000),  // 1 minute
    standardHeaders: "draft-6", 
    legacyHeaders: false,
    skipFailedRequests: true
};

try {
  validateRateLimitOptions(rateLimitOptions);

  app.use(rateLimiter(rateLimitOptions));
} catch (error) {
  console.error('Error configuring the rate limiter:', error);
}

app.get('/', (req, res) => {
  res.send('Welcome to the rate-limited application!');
});

app.get('/api', (req, res) => {
  res.send('This is an API endpoint protected by the rate limiter.');
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
