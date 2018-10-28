import * as Redis from 'ioredis';

const outEdgeKey = (from: number) => {
  if (process.env.NODE_ENV === 'test') {
    return `graph-test-virtual-edge-out:${from}`;
  }
  return `virtual-edge-out:${from}`;
};

const inEdgeKey = (from: number) => {
  if (process.env.NODE_ENV === 'test') {
    return `graph-test-virtual-edge-in:${from}`;
  }
  return `virtual-edge-in:${from}`;
};

const completeKey = (vertex: number) => {
  if (process.env.NODE_ENV === 'test') {
    return `graph-test-virtual-verterx:${vertex}`;
  }
  return `virtual-verterx:${vertex}`;
};

export class Graph {
  private redisClient: Redis.Redis;

  constructor() {
    if (process.env.NODE_ENV === 'PROD') {
      this.redisClient = new Redis({
        host: 'redis',
        dropBufferSupport: true,
      });
    } else {
      this.redisClient = new Redis({ dropBufferSupport: true });
    }
  }

  async setEdge(from: number, to: number) {
    this.redisClient.sadd(outEdgeKey(from), String(to));
    this.redisClient.sadd(inEdgeKey(to), String(from));
  }

  async setComplete(vertex: number) {
    return this.redisClient.set(completeKey(vertex), true);
  }

  async unsetComplete(vertex: number) {
    return this.redisClient.del(completeKey(vertex));
  }

  async unsetEdge(from: number, to: number) {
    this.redisClient.srem(outEdgeKey(from), String(to));
    this.redisClient.srem(inEdgeKey(to), String(from));
  }

  async isComplete(vertex: number): Promise<boolean> {
    const res = await this.redisClient.get(completeKey(vertex));
    return res == 'null' || res == null ? false : true;
  }

  async getInNodes(from: number): Promise<number[]> {
    return this.redisClient.smembers(inEdgeKey(from));
  }

  async getOutNodes(from: number): Promise<number[]> {
    return this.redisClient.smembers(outEdgeKey(from));
  }

  async shouldBeCompleted(from: number): Promise<boolean> {
    const nodes = await this.getInNodes(from);

    let isValid = true;
    for (let i = 0; i < nodes.length; i++) {
      const isCompleted = await this.isComplete(nodes[i]);
      if (!isCompleted) {
        isValid = false;
      }
    }

    return isValid;
  }

  async shouldBeUncompleted(from: number): Promise<boolean> {
    const nodes = await this.getOutNodes(from);

    let isValid = true;
    for (let i = 0; i < nodes.length; i++) {
      const isCompleted = await this.isComplete(nodes[i]);
      if (isCompleted) {
        isValid = false;
      }
    }

    return isValid;
  }

  async willBeCycle(newFrom: number, newTo: number[]): Promise<boolean> {
    const defaultGetter = {
      get: function(target, name) {
        return target.hasOwnProperty(name) ? target[name] : false;
      },
    };

    let isVisited = new Proxy({}, defaultGetter);
    let isInStack = new Proxy({}, defaultGetter);
    isVisited[newFrom] = true;
    isInStack[newFrom] = true;

    for (let i = 0; i < newTo.length; i++) {
      const node = newTo[i];

      if (await this.isCycleUtil(node, isVisited, isInStack)) {
        return true;
      }
    }
    return false;
  }

  private async isCycleUtil(
    v: number,
    isVisited: object,
    isInStack: object,
  ): Promise<boolean> {
    const isComplete = await this.isComplete(v);
    if (!isVisited[v] && !isComplete) {
      isVisited[v] = true;
      isInStack[v] = true;
      const nodes = await this.getOutNodes(v);

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (
          !isVisited[node] &&
          (await this.isCycleUtil(node, isVisited, isInStack))
        ) {
          return true;
        } else if (isInStack[node]) {
          return true;
        } else {
          return false;
        }
      }
    }

    return false;
  }
}
