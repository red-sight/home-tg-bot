// import { Job, Processor, Worker } from 'bullmq';
// import {
//   INewGroupQueueData,
//   newGroupQueue,
//   newGroupQueueProcessed,
// } from '@packages/queue';
// import { config } from '@packages/config';
// import { prisma } from '@packages/db';

// const processor: Processor = async function (job: Job<INewGroupQueueData>) {
//   console.log('A new chat is added', job.data.id);
//   try {
//     const tgChat = await prisma.tgChat.findFirst({
//       where: {
//         chatId: job.data.id.toString(),
//       },
//     });

//     if (!tgChat)
//       await prisma.tgChat.create({
//         data: {
//           chatId: job.data.id.toString(),
//           active: true,
//         },
//       });

//     await newGroupQueueProcessed.queue.add(job.data.id.toString(), {
//       id: job.data.id,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };

// new Worker(newGroupQueue.name, processor, { connection: config.redis });
