// Copyright 2018 Runrioter

import { Item } from './Item';

export function parseResponse(response: string): boolean {
  const result = response.split('\r\n', 1)[0];
  switch (result) {
    case 'STORED':
      return true;
    case 'NOT_STORED':
      throw new Error('memcache: item not stored');
    case 'EXISTS':
      throw new Error('memcache: compare-and-swap conflict');
    case 'NOT_FOUND':
      throw new Error('memcache: cache miss');
    default:
    throw new Error(`memcache: unexpected response line ${response}`);
  }
}
