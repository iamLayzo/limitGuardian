// import { Store, RateLimitInfo } from '../types';
// import cluster, { isPrimary, Worker,  } from 'cluster'; // Importamos el módulo y las funciones necesarias
// import { EventEmitter } from 'events';

// export default class ClusterMemoryStore implements Store {
//   private hits: Map<string, RateLimitInfo> = new Map();
//   private windowMs: number;
//   private eventEmitter: EventEmitter;
//   private openRequests: Map<number, { timeoutId: NodeJS.Timeout; resolve: (value: RateLimitInfo) => void }> = new Map();
//   private currentRequestId = 0;

//   constructor(windowMs: number) {
//     this.windowMs = windowMs;
//     this.eventEmitter = new EventEmitter();

//     if (isMaster || isPrimary) { // Aseguramos compatibilidad con ambas versiones
//       this.initPrimary();
//     } else {
//       this.initWorker();
//     }
//   }

//   private initPrimary() {
//     cluster.on('message', (worker: Worker, message: any) => {
//       if (message.type === 'rate-limit-increment') {
//         const { key } = message;
//         const clientInfo = this.incrementLocal(key);
//         worker.send({ type: 'rate-limit-info', clientInfo });
//       } else if (message.type === 'rate-limit-decrement') {
//         const { key } = message;
//         this.decrementLocal(key);
//       }
//     });
//   }

//   private initWorker() {
//     process.on('message', (message: any) => {
//       if (message.type === 'rate-limit-info') {
//         this.eventEmitter.emit(message.key, message.clientInfo);
//       }
//     });
//   }

//   private incrementLocal(key: string): RateLimitInfo {
//     let clientInfo = this.hits.get(key);

//     if (!clientInfo) {
//       clientInfo = { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs), limit: 100, remaining: 99 };
//       this.hits.set(key, clientInfo);
//     } else {
//       clientInfo.totalHits++;
//       clientInfo.remaining = Math.max(clientInfo.limit - clientInfo.totalHits, 0);
//     }

//     return clientInfo;
//   }

//   private decrementLocal(key: string) {
//     const clientInfo = this.hits.get(key);
//     if (clientInfo) {
//       clientInfo.totalHits = Math.max(clientInfo.totalHits - 1, 0);
//       clientInfo.remaining = Math.max(clientInfo.limit - clientInfo.totalHits, 0);
//       this.hits.set(key, clientInfo);
//     }
//   }

//   async increment(key: string): Promise<RateLimitInfo> {
//     if (isMaster || isPrimary) {
//       return this.incrementLocal(key);
//     } else {
//       process.send!({ type: 'rate-limit-increment', key });
//       return new Promise((resolve) => {
//         this.eventEmitter.once(key, (clientInfo: RateLimitInfo) => {
//           resolve(clientInfo);
//         });
//       });
//     }
//   }

//   async decrement(key: string): Promise<void> {
//     if (isMaster || isPrimary) {
//       this.decrementLocal(key);
//     } else {
//       process.send!({ type: 'rate-limit-decrement', key });
//     }
//   }

//   async resetKey(key: string): Promise<void> {
//     this.hits.delete(key);
//   }
// }
