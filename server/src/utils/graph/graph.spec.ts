import 'jest';

import { Graph } from './graph';
import * as Redis from 'ioredis';

const testKey = 'graph-test-*'

describe('Graph Util', () => {
  let redisClient: Redis.Redis;

  beforeAll(async () => {
    redisClient = new Redis();
  })

  beforeEach(async () => {
    const usedList = await redisClient.keys('graph-test-*');
    usedList.forEach(async (index) => {
      await redisClient.del(index);
    })
  })

  afterAll(async () => {
    const usedList = await redisClient.keys('graph-test-*');
    usedList.forEach(async (index) => {
      await redisClient.del(index);
    })
  })

  describe('setEdge', () => {
    it('should not add duplicate Edge', async () => {
      const g = new Graph();
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
      const g = new Graph();
      await g.setEdge(1, 2);
      await g.setEdge(1, 3);

      const beforeRemove = JSON.stringify(g.getOutNodes(1));

      await g.unsetEdge(1, 4);

      const afterRemove = JSON.stringify(g.getOutNodes(1));

      expect(beforeRemove).toEqual(afterRemove);
    });
  })

  describe('willBeCycle', () => {
    it('should return false without Cycle', async () => {
      const g = new Graph();

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
      const g = new Graph();

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
      const g = new Graph();

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
      const g = new Graph();

      await Promise.all([
        g.setEdge(1, 5),
        g.setEdge(5, 10),
      ]);

      await g.setComplete(5);

      expect(await g.willBeCycle(10, [1])).toEqual(false);
    });
  });
});
