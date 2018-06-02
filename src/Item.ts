export type Value = string | object | Buffer | null;

export interface Item {
  key: string | string [];
  value: Value | Value[];
  flags?: number;
  size?: number;
  casid?: number;
}
