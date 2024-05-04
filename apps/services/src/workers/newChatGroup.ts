import { prisma } from '@packages/db';
import { newChatGroupFlow, newChatGroupProcessedFlow } from '@packages/flow';

newChatGroupFlow.run(async job => {
  try {
    const tgChat = await prisma.tgChat.findFirst({
      where: {
        chatId: job.data.id.toString(),
      },
    });

    if (!tgChat)
      await prisma.tgChat.create({
        data: {
          chatId: job.data.id.toString(),
          active: true,
        },
      });

    await newChatGroupProcessedFlow.queue.add(job.data.id.toString(), {
      id: job.data.id,
    });
  } catch (error) {
    console.error(error);
  }
});
