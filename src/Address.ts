export enum NetType {
  TCP = 'tcp',
  IPC = 'ipc',
}

export interface NetAddress {
  net: NetType;
  toString(): string;
}

export class TCPAddress implements NetAddress {
  public readonly net = NetType.TCP;
  constructor(
    public readonly ip: string,
    public readonly port: number,
  ) {}
  public toString(): string {
    return `${this.net}(${this.ip}:${this.port})`;
  }
}

export class IPCAddress implements NetAddress {
  public readonly net = NetType.IPC;
  constructor(
    public readonly path: string,
  ) {}
  public toString(): string {
    return `${this.net}(${this.path}`;
  }
}

export type Address = TCPAddress | IPCAddress;
