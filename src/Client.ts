import { Socket, createConnection } from 'net';
import { Address, NetType } from './Address';
import { debuglog } from 'util';
const debug = debuglog('node-memcached');

export const DefaultMaxIdleConns = 10;
export const DefaultTimeout = 60 * 1000;

export class Client {
  private readonly connections: Socket[] = [];
  constructor(
    private address: Address,
    private timeout?: number,
    private maxIdleConns?: number,
  ) {}

  /**
   * getConnection
   */
  public getConnection(): Socket {
    let conn = this.connections.pop();
    if (typeof conn !== 'undefined') {
      return conn;
    }
    const addr = this.address;
    if (addr.net === NetType.TCP) {
      conn = createConnection(addr.port, addr.ip, () => {
        debug('create tcp socket %j', conn!.address());
        this.connections.push(conn!);
      });
    } else {
      conn = createConnection(addr.path, () => {
        debug('create ipc socket %j', conn!.address());
        this.connections.push(conn!);
      });
    }
    conn.setTimeout(this.timeout || DefaultTimeout, () => {
      const conns = this.connections;
      const index = conns.indexOf(conn!);
      if (index !== -1) {
        conns.splice(index, 1);
        conn!.unref();
        conn!.destroy();
      }
    });
    return conn;
  }

  public releaseConnection(conn: Socket): void {
    if (this.connections.length >= DefaultMaxIdleConns) {
      conn.destroy();
      conn.unref();
    } else {
      conn.setTimeout(this.timeout || DefaultTimeout);
      this.connections.push(conn);
    }
  }
}
