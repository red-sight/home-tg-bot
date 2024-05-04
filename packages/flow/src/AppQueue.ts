import { config } from '@packages/config';
import { Queue, QueueOptions } from 'bullmq';

export class AppQueue<T = void> {
  public name: string;
  public queue: Queue<T>;

  constructor(name: string, opts?: QueueOptions) {
    this.name = `${config.appName}:${name}`;
    this.queue = new Queue(name, {
      ...opts,
      defaultJobOptions: {
        // removeOnComplete: true,
        // removeOnFail: true,
        ...opts?.defaultJobOptions,
      },
      connection: config.redis,
    });
  }
}
