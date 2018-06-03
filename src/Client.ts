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
    const conn = this.connections.pop();
    if (typeof conn !== 'undefined') {
      return conn;
    }
    const addr = this.address;
    let nconn: Socket;
    if (addr.net === NetType.TCP) {
      nconn = createConnection(addr.port, addr.ip, () => {
        debug('create tcp socket %j', nconn.address());
      });
    } else {
      nconn = createConnection(addr.path, () => {
        debug('create ipc socket %j', nconn.address());
      });
    }
    nconn.setTimeout(this.timeout || DefaultTimeout, () => {
      const conns = this.connections;
      const index = conns.indexOf(nconn);
      if (index !== -1) {
        conns.splice(index, 1);
        nconn.destroy();
      }
    });
    return nconn;
  }

  public releaseConnection(conn: Socket): void {
    if (this.connections.length >= DefaultMaxIdleConns) {
      conn.destroy();
    } else {
      conn.setTimeout(this.timeout || DefaultTimeout);
      this.connections.push(conn);
    }
  }
}
