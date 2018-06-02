// Copyright 2018 Runrioter

import { crc32 } from 'crc';
import { EventEmitter } from 'events';
import { createConnection, Socket } from 'net';
import { debuglog } from 'util';
import { Item, parseResponse as GetParseResponse } from './command/Get';

const debug = debuglog('node-memcached');

interface TCPAgent {
  net: 'tcp';
  ip: string;
  port: number;
  sockets: Set<Socket>;
}

interface IPCAgent {
  net: 'ipc';
  path: string;
  sockets: Set<Socket>;
}

export type Agent = TCPAgent | IPCAgent;

export class MemcacheClient {

  private readonly addressList: Agent[] = [];

  constructor(private readonly addrs: string[]) {
    if (addrs.length === 0) {
      throw new Error('You need at least one memcached address.');
    }
    for (const addr of addrs) {
      const address = this.parseAddr(addr);
      this.addressList.push(address);
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

    const socket = this.getSocketByKey(key);
    socket.write(`${cmd}\r\n`);
    const p = new Promise<Item[]>((resolve, reject) => {
      socket.on('data', data => {
        const parsed = parser(data.toString());
        resolve(parsed);
      });
      socket.on('error', err => {
        const sockets = ((socket as any)._addr as Agent).sockets;
        sockets.forEach(skt => {
          if (skt === socket) {
            sockets.delete(socket);
          }
        });
        reject(err);
      });
      socket.on('lookup', err => {
        if (err !== undefined) {
          reject(err);
          const sockets = ((socket as any).addr as Agent).sockets;
          sockets.forEach(skt => {
            if (skt === socket) {
              sockets.delete(socket);
            }
          });
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

  private parseAddr(address: string): Agent {
    const matchTCP = address.match(/^tcp\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})\)$/);
    if (matchTCP !== null) {
      return {
        net: 'tcp',
        ip: matchTCP[1],
        port: parseInt(matchTCP[2], 10),
        sockets: new Set<Socket>(),
      };
    }
    const matchIPC = address.match(/^unix\((\/\S+)\)$/);
    if (matchIPC !== null) {
      return {
        net: 'ipc',
        path: matchIPC[1],
        sockets: new Set<Socket>(),
      };
    }
    throw Error(`node-memcached: bad address ${address}`);
  }

  private getSocketByKey(key: string): Socket {
    const index = crc32(key) % this.addressList.length;
    const addr = this.addressList[index];
    const { net } = addr;
    let skt: Socket;
    if (net === 'tcp') {
      const { ip: host, port } = addr as TCPAgent;
      skt = createConnection(port, host, () => {
        debug('create tcp socket %j', skt.address());
      });
    } else {
      const { path } = addr as IPCAgent;
      skt = createConnection(path, () => {
        debug('create ipc socket %j', skt.address());
        addr.sockets.add(skt);
      });
    }
    (skt as any)._addr = addr;
    return skt;
  }

}
