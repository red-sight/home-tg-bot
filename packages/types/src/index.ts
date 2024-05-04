export enum EDeviceType {
  router = 'router',
}

export enum ERouterType {
  entware = 'entware',
}

export enum queueName {
  newChatGroupQueue = 'newChatGroupQueue',
}

export interface IRouterLease {
  ip: string;
  name: string;
  mac: string;
  desc: string | undefined;
}
