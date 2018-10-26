import 'jest';

import { Graph } from './graph';

describe('Graph Util', () => {
  describe('isCycle', () => {
    it('should return false without Cycle', async () => {
      const g = new Graph();

      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(1, 5);

      g.addEdge(5, 3);
      g.addEdge(5, 4);
      g.addEdge(5, 6);
      g.addEdge(5, 7);
      g.addEdge(5, 8);

      expect(g.isCycle()).toEqual(false);
    });

    it('should return true with Cycle', async () => {
      const g = new Graph();

      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(1, 5);

      g.addEdge(5, 6);
      g.addEdge(5, 7);
      g.addEdge(5, 8);
      g.addEdge(5, 9);
      g.addEdge(5, 10);

      // Cycle
      g.addEdge(5, 1);

      expect(g.isCycle()).toEqual(true);
    });

    it('should return true with transitive Cycle', async () => {
      const g = new Graph();

      g.addEdge(1, 2);
      g.addEdge(1, 3);
      g.addEdge(1, 4);
      g.addEdge(1, 5);

      g.addEdge(5, 6);
      g.addEdge(5, 7);
      g.addEdge(5, 8);
      g.addEdge(5, 9);
      g.addEdge(5, 10);

      // Cycle
      g.addEdge(10, 1);

      console.log(JSON.stringify(g))

      expect(g.isCycle()).toEqual(true);
    });
  });
});
