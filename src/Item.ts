import { Buffer } from 'buffer';

export type Key = string | Buffer;
export type Value = string | Buffer | null;

export interface Item {
  key: Key;
  value: Value;
  flags?: number;
  exptime?: number;
  bytes?: number;
  casid?: number;
}

export function isLegalKey(key: Key): boolean {
  const len = Buffer.byteLength(key);
  if (len > 250) {
    return false;
  }
  const buf = Buffer.alloc(len, key);
  for (const byte of buf) {
    if ((byte <= 0x20) || (byte === 0x7F)) {
      return false;
    }
  }
  return true;
}
