import type Client from '@/Client';

export default abstract class Base {
  public readonly client!: Client;

  protected constructor(client: Client) {
    this.client = client;
  }
}
