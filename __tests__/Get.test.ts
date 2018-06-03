import { parseResponse } from '../src/GetCommand';

describe('Command', () => {
  describe('Get', () => {
    test('parse no value', () => {
      const expected = [
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          bytes: 9,
          value: 'runrioter',
        },
      ];
      expect(parseResponse('END\r\n')).toEqual([]);
    });
    test('parse one value', () => {
      const expected = [
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          bytes: 9,
          value: 'runrioter',
        },
      ];
      expect(parseResponse('VALUE runrioter 212 9\r\nrunrioter\r\nEND\r\n')).toEqual(expected);
    });
    test('parse two value', () => {
      const expected = [
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          bytes: 9,
          value: 'runrioter',
        },
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter2',
          bytes: 9,
          value: 'runrioter',
        },
      ];
      expect(parseResponse('VALUE runrioter 212 9\r\nrunrioter\r\nVALUE runrioter2 212 9\r\nrunrioter\r\nEND\r\n')).toEqual(expected);
    });
  });
});
