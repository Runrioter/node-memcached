// Copyright 2018 Runrioter

import { crc32 } from 'crc';
import { createConnection, Socket } from 'net';
import { debuglog } from 'util';
import { parseResponse as GetParseResponse } from './command/Get';
import { Item } from './Item';
import { Address, TCPAddress, IPCAddress } from './Address';
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
    private readonly config: Config = { timeout: DefaultTimeout, maxIdleConns: DefaultMaxIdleConns },
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

  public get(key: string, cb?: (err: Error | null, data?: Item[]) => void): Promise<Item[]> | void {
    const p = this.runCommand(`get ${key}`, key, GetParseResponse);
    if (typeof cb === 'function') {
      (p as Promise<Item[]>).then(data => {
        cb(null, data);
      }).catch(cb);
      return;
    }
    return p;
  }

  private runCommand(
    cmd: string,
    key: string,
    parser: (response: string) => Item[],
    cb?: (err: Error | null, data?: string | object) => void,
  ): Promise<Item[]> | void {
    const client = this.getClient(key);
    const conn = client.getConnection();
    conn.write(`${cmd}\r\n`);
    const p = new Promise<Item[]>((resolve, reject) => {
      conn.on('data', data => {
        const parsed = parser(data.toString());
        client.releaseConnection(conn);
        resolve(parsed);
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

  private getConnection(key: string): Socket {
    const client = this.getClient(key);
    return client.getConnection();
  }

  private getClient(key: string): Client {
    const index = crc32(key) % this.addresses.length;
    const addr = this.addresses[index];
    let client = this.clients.get(addr);
    if (typeof client === 'undefined') {
      client = new Client(addr, this.config.timeout, this.config.maxIdleConns);
      this.clients.set(addr, client);
    }
    return client;
  }

}
