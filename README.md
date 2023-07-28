# Paymagic JS

A library to interact with [Paymagic API](https://docs.patchwallet.com/).

## Installation

```bash
npm install @paymagic/js
```

or you can use yarn

```bash
yarn add @paymagic/js
```

## Usage

```ts
import { Client } from '@paymagic/js';

const client = new Client();

(async () => {
    const resolvedName = await client.resolveName('vanxhh', 'twitter');
    console.log(resolvedName);
})();
```
