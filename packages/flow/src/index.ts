// import { Queue, QueueOptions } from 'bullmq';
// import type { Prisma } from '@packages/db';
// import { config } from '@packages/config';

// export interface INewGroupQueueData {
//   id: number;
// }

// export interface IDhcpLeaseQueueData {
//   lease: Prisma.DhcpLease;
//   chats: Prisma.TgChat[];
// }

// export interface IDhcpLeaseStatusQueueData extends IDhcpLeaseQueueData {
//   status: boolean;
//   time: string;
// }

// export const newGroupQueue = new AppQueue<INewGroupQueueData>('new-group');

// export const newGroupQueueProcessed = new AppQueue<INewGroupQueueData>(
//   'new-group-processed'
// );

// export const newDhcpLeaseQueue = new AppQueue<IDhcpLeaseQueueData>(
//   'new-dhcp-lease'
// );

// export const dhcpLeaseStatusQueue = new AppQueue<IDhcpLeaseStatusQueueData>(
//   'dhcp-lease-status'
// );
export * from './AppQueue';
export * from './Flow';
export * from './flows';
