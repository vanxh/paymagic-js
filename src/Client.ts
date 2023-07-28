import { ethers } from 'ethers';
import { ChainId } from './enums';
import HTTP from './http/HTTP';
import type { ClientConfig, WalletProvider } from './types';

export default class Client {
  public config: ClientConfig;

  public http: HTTP;

  constructor(config: Partial<ClientConfig> = {}) {
    this.config = {
      logging: config.logging ?? true,
      paymagicBaseURL:
        config.paymagicBaseURL?.replace(/\/$/, '') ?? 'https://paymagicapi.com',
      paymagicAPIVersion: config.paymagicAPIVersion ?? 'v1',
      network: config.network ?? ChainId.Mainnet,
      ethersProvider: ethers.getDefaultProvider(
        config.network ?? ChainId.Mainnet,
      ),
    };

    this.http = new HTTP(this);
  }

  public debug(message: string, type: 'regular' | 'http' = 'regular') {
    if (!this.config.logging) return;

    switch (type) {
      case 'regular':
        // eslint-disable-next-line no-console
        console.log(`[DEBUG] ${message}`);
        break;

      case 'http':
        // eslint-disable-next-line no-console
        console.log(`[HTTP] ${message}`);
        break;
    }
  }

  public async resolveNameUsingENS(name: string, provider: WalletProvider) {
    const resolvedAddress = await this.config.ethersProvider.resolveName(
      `${name}.${provider}.usr.id`,
    );

    if (!resolvedAddress) {
      throw new Error(`Could not resolve ${name}.${provider}.usr.id`);
    }

    return resolvedAddress;
  }

  public async resolveNames(userIds: string[]) {
    const res = await this.http.paymagicAPIRequest<{
      updatedAt: string;
      users: {
        userId: string;
        accountAddress: string;
      }[];
    }>('POST', '/resolver', {
      data: {
        userIds: userIds.join(','),
      },
    });

    return res.users.map((u) => ({
      ...u,
      accountAddress: u.accountAddress ? u.accountAddress : null,
    }));
  }

  public async resolveName(name: string, provider: WalletProvider) {
    const res = await this.resolveNames([`${provider}:${name}`]);

    const resolvedAddress = res.find(
      (user) => user.userId === `${provider}:${name}`,
    )?.accountAddress;

    if (!resolvedAddress) {
      throw new Error(`Could not resolve ${name}.${provider}.usr.id`);
    }

    return resolvedAddress;
  }
}
