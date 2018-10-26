import * as Redis from 'ioredis';

type Value = object | string | number;
const group = 'todo';

interface TodoStorageConfigurations {
  isTest: boolean;
}

export class TodoStorage {
  private readonly redisClient;

  constructor(config?: TodoStorageConfigurations) {
    if (config !== undefined && config.isTest === true) {
      // For mocking
      this.redisClient = Redis.prototype;
    } else {
      // Connect to a real redis server
      this.redisClient = new Redis({ dropBufferSupport: true });
    }
  }

  async set(group: string, key: number, value: Value) {
    const convertedValue = JSON.stringify(value);

    await this.redisClient
      .multi()
      .zremrangebyscore(group, key, key)
      .zadd(group, key, convertedValue)
      .exec();
  }

  async get(group: string, key: number): Promise<Value> {
    const res = await this.redisClient.zrangebyscore(group, key, key);
    if (res.length === 0) {
      return null;
    }
    return JSON.parse(res[0]);
  }

  async getRange(
    group: string,
    offset: number,
    limit: number,
  ): Promise<Value[]> {
    // getRange by reverse order

    const size = await this.getGroupSize(group);
    const data = await this.redisClient.zrangebyscore(
      group,
      0,
      Infinity,
      'LIMIT',
      String(Math.max(size - offset - limit + 1, 0)),
      String(size - offset + 1),
    );

    const res = data.map(item => JSON.parse(item)).reverse();

    return res;
  }

  async getGroupSize(group: string) {
    return this.redisClient.zcount(group, 0, Infinity);
  }

  async getTodoIndex(): Promise<Value> {
    const res = await this.redisClient
      .multi()
      .incr('todo-index')
      .get('todo-index')
      .exec();

    return res[0][1];
  }
}
