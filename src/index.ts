// Copyright 2018 Runrioter

import { crc32 } from 'crc';
import { Item, isLegalKey, Key } from './Item';
import { debuglog } from 'util';
import { createConnection, Socket } from 'net';
import { Address, TCPAddress, IPCAddress } from './Address';
import { parseResponse as GetParseResponse } from './GetCommand';
import { parseResponse as SetParseResponse } from './SetCommand';
import { Client, DefaultTimeout, DefaultMaxIdleConns } from './Client';

const debug = debuglog('node-memcached');

export interface Config {
  timeout?: number;
  maxIdleConns?: number;
}

export class Memcached {

  private readonly clients: Map<Address, Client> = new Map();
  private readonly addresses: Address[] = [];

  constructor(
    private readonly addrs: string[],
    private readonly config: Config = {
      timeout: DefaultTimeout,
      maxIdleConns: DefaultMaxIdleConns,
    },
  ) {
    if (addrs.length === 0) {
      throw new Error('You need at least one memcached address.');
    }
    for (const addr of addrs) {
      const address = this.parseAddr(addr);
      this.addresses.push(address);
    }
    debug('memcached address %j', addrs);
  }

  public get(
    key: string,
    cb?: (err: Error | null, data?: Item[]) => void,
  ): Promise<Item[]> | void {
    const p = this.runCommand(`get ${key}`, key, GetParseResponse) as Promise<Item[]>;
    if (typeof cb === 'function') {
      p.then(data => {
        cb(null, data);
      }).catch(cb);
      return;
    }
    return p;
  }

  public set(
    item: Item,
    cb?: (err: Error | null, data?: boolean) => void,
  ): Promise<boolean> | void {
    const { key, value } = item;
    if (!isLegalKey(key)) {
      if (cb) {
        return cb(new Error('memcached: key is too long or contains invalid characters'));
      } else {
        throw new Error('memcached: key is too long or contains invalid characters');
      }
    }
    const flags = item.flags || 0;
    const exptime = item.exptime || 0;
    const bytes = Buffer.byteLength(key);
    const p = this.runCommand(
      `set ${key} ${flags} ${exptime} ${bytes}\r\n${value}\r\n`,
      key,
      SetParseResponse,
    ) as Promise<boolean>;
    if (cb) {
      p.then(data => {
        cb(null, data);
      }).catch(cb);
      return;
    }
    return p;
  }

  private runCommand(
    cmd: string,
    key: Key,
    parser: (response: string) => Item[] | boolean,
    cb?: (err: Error | null, data?: Item[] | boolean) => void,
  ): Promise<Item[] | boolean> | void {
    const client = this.getClient(key);
    const conn = client.getConnection();
    conn.write(`${cmd}\r\n`);
    const p = new Promise<Item[] | boolean>((resolve, reject) => {
      conn.on('data', data => {
        try {
          const parsed = parser(data.toString());
          client.releaseConnection(conn);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
      conn.on('error', err => {
        reject(err);
      });
      conn.on('lookup', err => {
        if (err !== undefined) {
          reject(err);
        }
      });
    });
    if (typeof cb === 'function') {
      p.then(data => {
        cb(null, data);
      }).catch(cb);
      return;
    }
    return p;
  }

  private parseAddr(addr: string): Address {
    const matchTCP = addr.match(/^tcp\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})\)$/);
    if (matchTCP !== null) {
      return new TCPAddress(matchTCP[1], parseInt(matchTCP[2], 10));
    }
    const matchIPC = addr.match(/^unix\((\/\S+)\)$/);
    if (matchIPC !== null) {
      return new IPCAddress(matchIPC[1]);
    }
    throw Error(`node-memcached: bad address ${addr}`);
  }

  private getConnection(key: Key): Socket {
    const client = this.getClient(key);
    return client.getConnection();
  }

  private getClient(key: Key): Client {
    const index = crc32(key) % this.addresses.length;
    const addr = this.addresses[index];
    let client = this.clients.get(addr);
    if (typeof client === 'undefined') {
      const { timeout, maxIdleConns } = this.config;
      client = new Client(addr, timeout, maxIdleConns);
      this.clients.set(addr, client);
    }
    return client;
  }

}
