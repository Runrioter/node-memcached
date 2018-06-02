import { MemcacheClient } from '../src/.';

const mc = new MemcacheClient(['tcp(127.0.0.1:11211)']);

describe('MemcachedClient', () => {
  describe('get', () => {
    test('Promise', async () => {
      expect.assertions(1);
      await expect(mc.get('runrioter')).resolves.toEqual([
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          size: 9,
          value: 'runrioter',
        },
      ]);
    });
    test('Callback', done => {
      mc.get('runrioter', (err, data) => {
        if (err) {
          expect(err).toBeInstanceOf(Error);
          return done();
        }
        expect(data).toEqual([{
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          size: 9,
          value: 'runrioter',
        }]);
        done();
      });
    });
  });
});
