import { parseResponse } from '../src/command/Get';

describe('Command', () => {
  describe('Get', () => {
    test('parse no value', () => {
      const expected = [
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          size: 9,
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
          size: 9,
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
          size: 9,
          value: 'runrioter',
        },
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter2',
          size: 9,
          value: 'runrioter',
        },
      ];
      expect(parseResponse('VALUE runrioter 212 9\r\nrunrioter\r\nVALUE runrioter2 212 9\r\nrunrioter\r\nEND\r\n')).toEqual(expected);
    });
  });
});
