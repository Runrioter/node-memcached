// Copyright 2018 Runrioter

import { Item } from './Item';

export function parseResponse(response: string): Item[] {
  const blocks = response.split('\r\n');
  const items: Item[] = [];
  const len = blocks.length;
  for (let i = 0; i < len; i++) {
    const line = blocks[i];
    if (line === 'END') { break; }
    const item = parseResponseLine(line);
    if (item === null) {
      throw new Error('bad response');
    }
    const { bytes } = item;
    const value = blocks[++i];
    if (bytes !== Buffer.byteLength(value)) {
      throw new Error('bad response value');
    }
    item.value = value;
    items.push(item);
  }
  return items;
}

function parseResponseLine(line: string): Item | null {
  const itemTokens = line.match(/^VALUE (\S+) (\d+) (\d+)( \d+)?$/);
  if (itemTokens === null) {
    return null;
  }
  return {
    key: itemTokens[1],
    value: null,
    flags: parseInt10(itemTokens[2])!,
    bytes: parseInt10(itemTokens[3]),
    casid: parseInt10(itemTokens[4]),
  };
  function parseInt10(numeric: string): number | undefined {
    if (typeof numeric === 'undefined') {
      return undefined;
    }
    return parseInt(numeric, 10);
  }
}
