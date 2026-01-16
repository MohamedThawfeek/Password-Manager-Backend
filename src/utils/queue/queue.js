// utils/emailQueue.js
const PQueue = require("p-queue").default

// Concurrency: 1 ensures one email send at a time
const emailQueue = new PQueue({ concurrency: 1 });

module.exports = emailQueue;


// let emailQueue;

// (async () => {
//   const PQueue = (await import('p-queue')).default;
//   emailQueue = new PQueue({ concurrency: 1 });
// })();

// module.exports = {
//   getQueue: () => emailQueue,
// };