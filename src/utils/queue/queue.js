// utils/emailQueue.js
// Email queue for managing email sending operations
// Concurrency: 1 ensures one email send at a time to prevent overwhelming the email service

let emailQueue;
let queuePromise;

// Initialize queue with dynamic import (p-queue v9 is ESM only)
const initQueue = async () => {
  if (emailQueue) {
    return emailQueue;
  }
  
  if (queuePromise) {
    return await queuePromise;
  }
  
  queuePromise = (async () => {
    try {
      const PQueueModule = await import('p-queue');
      const PQueue = PQueueModule.default || PQueueModule;
      emailQueue = new PQueue({ 
        concurrency: 1,
        interval: 1000, // Wait 1 second between batches
        intervalCap: 1, // Process 1 email per interval
      });
      return emailQueue;
    } catch (error) {
      console.error('Failed to initialize email queue:', error);
      queuePromise = null;
      throw error;
    }
  })();
  
  return await queuePromise;
};

// Initialize queue immediately
initQueue().catch(err => {
  console.error('Error initializing email queue:', err);
});

// Export queue with methods that ensure initialization
module.exports = {
  add: async (fn, options) => {
    const queue = await initQueue();
    return queue.add(fn, options);
  },
  onIdle: async () => {
    const queue = await initQueue();
    return queue.onIdle();
  },
  onSizeLessThan: async (limit) => {
    const queue = await initQueue();
    return queue.onSizeLessThan(limit);
  },
  clear: async () => {
    const queue = await initQueue();
    return queue.clear();
  },
  pause: async () => {
    const queue = await initQueue();
    return queue.pause();
  },
  start: async () => {
    const queue = await initQueue();
    return queue.start();
  },
  // Get the queue instance directly (use with caution)
  getQueue: async () => {
    return await initQueue();
  },
};