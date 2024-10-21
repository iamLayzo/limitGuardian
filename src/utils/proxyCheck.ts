// src/utils/proxyCheck.ts
import { Request } from 'express';

export const checkProxy = (req: Request): boolean => {
  const trustProxy = req.app.get('trust proxy');
  const xForwardedFor = req.headers['x-forwarded-for'];
  
  if (xForwardedFor && !trustProxy) {
    throw new Error('Proxy detected but "trust proxy" is not enabled.');
  }

  return !!trustProxy;
};
