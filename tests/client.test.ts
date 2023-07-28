import { Client } from '../src';

let client: Client;
beforeEach(() => {
  client = new Client();
});

describe('Client', () => {
  it('should be able to create a client', () => {
    expect(client).toBeInstanceOf(Client);
    expect(client.config).toBeDefined();
  });

  it('should be able to resolve a paymagic ens', async () => {
    const resolved = await client.resolveName('vanxhh', 'twitter');
    expect(resolved).toBe('0xef773117aDeA17cf8aeF6d393a7aB6521150A4Ca');
  });
});
