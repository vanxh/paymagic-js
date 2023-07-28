import type { Networkish, Provider } from 'ethers';

export interface ClientConfig {
  logging?: boolean;

  paymagicBaseURL?: string;
  paymagicAPIVersion?: 'v1';

  network: Networkish,
  ethersProvider: Provider
}
