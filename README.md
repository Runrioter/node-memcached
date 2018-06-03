node-memcached
======

A NodeJS memcached client

__WIP__

### API

* Retrieval
  * callback style: `get(key: string, cb: (err: Error | null, data?: Item[]) => void): void`
  * promise style: `get(key: string): Promise<Item[]>`



### LICENSE

[MIT](LICENSE)