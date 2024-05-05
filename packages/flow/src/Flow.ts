import { Processor, Queue, QueueOptions, Worker, WorkerOptions } from 'bullmq';
import { config } from '@packages/config';
const connection = config.redis;

export class Flow<IQueueData = void> {
  public queue: Queue<IQueueData>;
  public queueName: string;
  public worker?: Worker;

  constructor({ name, queueOpts }: { name: string; queueOpts?: QueueOptions }) {
    this.queueName = name;
    this.queue = new Queue<IQueueData>(name, {
      ...queueOpts,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        ...queueOpts?.defaultJobOptions,
      },
      prefix: config.appName,
      connection,
    });
  }

  public run(processor: Processor<IQueueData>, workerOpts?: WorkerOptions) {
    if (this.worker) throw new Error('Worker is already defined');
    this.worker = new Worker<IQueueData>(this.queueName, processor, {
      ...workerOpts,
      prefix: config.appName,
      connection,
    });
    this.worker.on('error', e => {
      console.error(e);
    });
  }
}
