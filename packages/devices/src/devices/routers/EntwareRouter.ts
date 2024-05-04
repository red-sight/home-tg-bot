import { ERouterType } from '@packages/types';
import { Router } from '../Router';
import { Config, NodeSSH, SSHExecCommandOptions } from 'node-ssh';
import { IRouterLease } from '@packages/types';

interface IEntwareRouterOpts extends Config {
  name: string;
  supressWarnings: boolean;
}

export class EntwareRouter extends Router {
  private config: Config;
  public connection?: NodeSSH;
  public name: string;
  public ssh: NodeSSH = new NodeSSH();
  private supressWarnings: boolean;

  constructor({ name, supressWarnings = true, ...config }: IEntwareRouterOpts) {
    super({ routerType: ERouterType.entware });
    this.name = name;
    this.supressWarnings = supressWarnings;
    this.config = config;
  }

  public async connect(): Promise<EntwareRouter> {
    try {
      this.connection = await this.ssh.connect(this.config);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Failed to connect to router ${this.name}\n ${e}`);
    }
    return this;
  }

  public async request(givenCommand: string, options?: SSHExecCommandOptions) {
    if (!this.connection) await this.connect();
    const res = await this.connection?.execCommand(givenCommand, options);
    if (!res) throw new Error('No response from router');
    if (res.code !== 0) {
      if (res.stderr)
        throw new Error(
          `Router "${this.name}" SSH command returned status ${res.code}, ${res.stderr}`
        );
    }
    if (res.stderr && !this.supressWarnings)
      console.warn(
        `Router "${this.name}" SSH command returned non-critical error: ${res.stderr}`
      );
    return res;
  }

  public async listLeases(): Promise<IRouterLease[]> {
    const res = await this.request(
      "arp-scan --interface=br0 --localnet -d --format='${ip}\t${name}\t${mac}\t${vendor}'"
    );
    const leases: IRouterLease[] = [];
    res.stdout
      .split('\n')
      .slice(2, -3)
      .forEach(line => {
        const arr = line.split('\t');
        const [ip, name, mac, desc] = arr;
        if (ip && name && mac) leases.push({ ip, name, mac, desc });
      });
    return leases;
  }
}
