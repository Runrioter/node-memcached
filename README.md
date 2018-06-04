node-memcached
======

A NodeJS memcached client

__WIP__

### API

* Retrieval
  * callback style: `get(key: string, cb: (err: Error | null, data?: Item[]) => void): void`
  * promise style: `get(key: string): Promise<Item[]>`

* Storage
  
  Item: `{ key: Key; value: Value; flags?: number; exptime?: number;}`

  * callback style: `set(item: Item, cb: (err: Error | null, data?: boolean | undefined) => void): void`
  * promise style: `set(item: Item): Promise<boolean>`



### LICENSE

[MIT](LICENSE)