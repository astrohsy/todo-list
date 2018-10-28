import 'jest';

import * as Redis from 'ioredis';

import { Todo } from '../../todos/interfaces/todo.interface';
import { TodoStorage } from './storage';

describe('Storage Util', () => {
  let storage: TodoStorage;
  let redisClient: Redis.Redis;

  const testRedisKey = 'storage-test';

  beforeAll(async () => {
    storage = new TodoStorage();
    redisClient = new Redis();
  });

  afterEach(async () => {
    redisClient.del(testRedisKey);
  });

  describe('Set & Get', () => {
    it('should set and get same value', async () => {
      const todo: Todo = {
        id: 1,
        text: 'test',
        references: [1, 2],
        createdAt: new Date(),
      };

      await storage.set(testRedisKey, 1, todo);
      const res = await storage.get(testRedisKey, 1);

      expect(JSON.stringify(res)).toEqual(JSON.stringify(todo));
    });
  });

  describe('getIndex', () => {
    it('should resist race condition on getIndex', async () => {
      const testIndexName = 'test-index';
      const res = await Promise.all([
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
        storage.getIndex(testIndexName),
      ]);

      expect(new Set(res).size).toEqual(res.length);
    });
  });

  describe('getRange', () => {
    it('should return items with given limit and offset', async () => {
      Promise.all(
        Array.from(new Array(30).keys()).map(async value => {
          storage.set(testRedisKey, value, value);
        }),
      );

      const offset = 21;
      const limit = 10;
      const values = await storage.getRange(testRedisKey, offset, limit);
      const expectedValues = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      for (let i = 0; i < limit; i++) {
        expect(values[i]).toEqual(expectedValues[i]);
      }
    });

    it('should return last items segment correctly', async () => {
      await Promise.all(
        Array.from(new Array(12).keys()).map(async value => {
          storage.set(testRedisKey, value, value);
        }),
      );

      const offset = 10;
      const limit = 5;
      const values = await storage.getRange(testRedisKey, offset, limit);

      // Case: Last segment has smaller size than the limit
      const expectedValues = [1, 0];
      for (let i = 0; i < limit; i++) {
        expect(values[i]).toEqual(expectedValues[i]);
      }
    });

    it('should return items with given larger beyond its size', async () => {
      await Promise.all(
        Array.from(new Array(10).keys()).map(async value => {
          storage.set(testRedisKey, value, value);
        }),
      );

      const offset = 5;
      const limit = 10;
      const values = await storage.getRange(testRedisKey, offset, limit);
      const expectedValues = [4, 3, 2, 1, 0];
      for (let i = 0; i < limit; i++) {
        expect(values[i]).toEqual(expectedValues[i]);
      }
    });
  });

  describe('getGroupSize', () => {
    it('should return the number of items', async () => {
      await Promise.all(
        Array.from(new Array(30).keys()).map(async value => {
          storage.set(testRedisKey, value, value);
        }),
      );

      const size = await storage.getGroupSize(testRedisKey);
      expect(size).toEqual(30);
    });
  });
});
