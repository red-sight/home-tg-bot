import { ConnectionOptions } from 'bullmq';
import { IRouterConfig } from '.';

export interface IConfig {
  appName: string;
  appServer: {
    port?: number;
  };
  tgBot: {
    token: string | undefined;
    owner: string | undefined;
  };
  redis: ConnectionOptions;
  routers: IRouterConfig[];
}
