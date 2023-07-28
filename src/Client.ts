import type { ClientConfig } from '@/types';

export default class Client {
  private config : ClientConfig;

  constructor(config: ClientConfig = {}) {
    this.config = {
      logging: config.logging ?? true,
    };
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
}
