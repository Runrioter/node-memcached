import { Memcached } from '../src/.';

const mc = new Memcached(['tcp(127.0.0.1:11211)']);

describe('MemcachedClient', () => {
  describe('get', () => {
    test('Promise', async () => {
      expect.assertions(1);
      await expect(mc.get('runrioter')).resolves.toEqual([
        {
          casid: undefined,
          flags: 212,
          key: 'runrioter',
          bytes: 9,
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
          bytes: 9,
          value: 'runrioter',
        }]);
        done();
      });
    });
  });
  describe('set', () => {
    test('Promise', async () => {
      expect.assertions(1);
      await expect(mc.set({ key: 'wang1', flags: 0, exptime: 0, value: 'wang1' })).resolves.toBe(true);
    });
    test('Callback', done => {
      mc.set({ key: 'wang2', flags: 0, exptime: 0, value: 'wang2' }, (err, data) => {
        if (err) {
          expect(err).toBeInstanceOf(Error);
          return done();
        }
        expect(data).toBe(true);
        done();
      });
    });
  });
});
