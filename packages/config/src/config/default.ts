import { ERouterType } from '@packages/types';
import { IConfig } from '../config.types';
import { IRouterConfig } from '..';

const routers: IRouterConfig[] = [];
if (process.env['TENDA_PK'])
  routers.push({
    type: ERouterType.entware,
    name: 'Tenda AC15',
    host: '192.168.1.1',
    username: 'root',
    privateKey: process.env['TENDA_PK'],
    dhcpLeaseCheckTimeout: 5000,
  });

export const defaultConfig: IConfig = {
  appName: 'home-tg-bot',
  appServer: {
    port: 3001,
  },
  tgBot: {
    token: process.env['TG_BOT_TOKEN'],
    owner: process.env['TG_BOT_OWNER'],
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  routers,
};
