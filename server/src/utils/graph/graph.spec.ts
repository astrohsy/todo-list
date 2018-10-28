import 'jest';

import * as Redis from 'ioredis';

import { Graph } from './graph';

const testKey = 'graph-test-*';

describe('Graph Util', () => {
  let redisClient: Redis.Redis;
  let g: Graph;

  beforeAll(async () => {
    redisClient = new Redis();
    g = new Graph();
  });

  beforeEach(async () => {
    const usedList = await redisClient.keys(testKey);
    usedList.forEach(async index => {
      await redisClient.del(index);
    });
  });

  afterAll(async () => {
    const usedList = await redisClient.keys(testKey);
    usedList.forEach(async index => {
      await redisClient.del(index);
    });
  });

  describe('setEdge', () => {
    it('should not add duplicate Edge', async () => {
      await g.setEdge(1, 2);
      await g.setEdge(1, 3);

      const beforeAdd = JSON.stringify(g.getOutNodes(1));

      await g.setEdge(1, 2);
      await g.setEdge(1, 2);

      const afterAdd = JSON.stringify(g.getOutNodes(1));

      expect(beforeAdd).toEqual(afterAdd);
    });
  });

  describe('unsetEdge', () => {
    it('should not remove if there is no such edges', async () => {
      await g.setEdge(1, 2);
      await g.setEdge(1, 3);

      const beforeRemove = JSON.stringify(g.getOutNodes(1));

      await g.unsetEdge(1, 4);

      const afterRemove = JSON.stringify(g.getOutNodes(1));

      expect(beforeRemove).toEqual(afterRemove);
    });
  });

  describe('willBeCycle', () => {
    it('should return false without Cycle', async () => {
      await Promise.all([
        g.setEdge(1, 2),
        g.setEdge(1, 3),
        g.setEdge(1, 4),
        g.setEdge(1, 5),

        g.setEdge(5, 3),
        g.setEdge(5, 4),
        g.setEdge(5, 6),
        g.setEdge(5, 7),
      ]);

      expect(await g.willBeCycle(7, [8])).toEqual(false);
    });

    it('should return true with Cycle', async () => {
      await Promise.all([
        g.setEdge(1, 2),
        g.setEdge(1, 3),
        g.setEdge(1, 4),
        g.setEdge(1, 5),
        g.setEdge(5, 6),
        g.setEdge(5, 7),
        g.setEdge(5, 8),
        g.setEdge(5, 9),
        g.setEdge(5, 10),
      ]);

      expect(await g.willBeCycle(5, [1])).toEqual(true);
    });

    it('should return true with transitive Cycle', async () => {
      await Promise.all([
        g.setEdge(1, 2),
        g.setEdge(1, 3),
        g.setEdge(1, 4),
        g.setEdge(1, 5),

        g.setEdge(5, 6),
        g.setEdge(5, 7),
        g.setEdge(5, 8),
        g.setEdge(5, 9),
        g.setEdge(5, 10),
      ]);

      expect(await g.willBeCycle(10, [1])).toEqual(true);
    });

    it('should return false when checked Node is on Cycle', async () => {
      await Promise.all([g.setEdge(1, 5), g.setEdge(5, 10)]);

      await g.setComplete(5);

      expect(await g.willBeCycle(10, [1])).toEqual(false);
    });
  });

  describe('shouldBeCompleted', () => {
    it('should return true on no Edge', async () => {
      const res = await g.shouldBeCompleted(1);
      expect(res).toEqual(true);
    });

    it('should return true on edges to checked vertex', async () => {
      await Promise.all([g.setEdge(1, 5), g.setEdge(10, 5)]);

      await g.setComplete(1);
      await g.setComplete(10);

      const res = await g.shouldBeCompleted(5);
      expect(res).toEqual(true);
    });

    it('should return false on edges to unchecked vertex', async () => {
      await Promise.all([g.setEdge(1, 5), g.setEdge(10, 5)]);

      await g.setComplete(1);

      const res = await g.shouldBeCompleted(5);
      expect(res).toEqual(false);
    });

    it('should return false on edges to all unchecked vertex', async () => {
      await Promise.all([g.setEdge(1, 5), g.setEdge(10, 5)]);

      const res = await g.shouldBeCompleted(5);
      expect(res).toEqual(false);
    });
  });
});
