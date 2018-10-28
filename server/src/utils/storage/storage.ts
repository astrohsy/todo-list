import * as Redis from 'ioredis';
import { Todo } from 'todos/interfaces/todo.interface';

type Value = Todo | string | number;

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

      if (process.env.NODE_ENV === 'PROD') {
        this.redisClient = new Redis({
          host: 'redis',
          dropBufferSupport: true,
        });
      } else {
        this.redisClient = new Redis({ dropBufferSupport: true });
      }
    }
  }

  async set(group: string, key: number, value: Value): Promise<Value> {
    const convertedValue = JSON.stringify(value);

    const res = await this.redisClient
      .multi()
      .zremrangebyscore(group, key, key)
      .zadd(group, key, convertedValue)
      .zrangebyscore(group, key, key)
      .exec();

    return JSON.parse(res[2][1]);
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
    const realOffset = Math.max(size - offset - limit, 0);

    const data = await this.redisClient.zrangebyscore(
      group,
      0,
      Infinity,
      'LIMIT',
      String(realOffset),
      String(Math.min(limit, size - offset)),
    );

    const res = data.map(item => JSON.parse(item)).reverse();

    return res;
  }

  async getGroupSize(group: string) {
    return this.redisClient.zcount(group, 0, Infinity);
  }

  async getIndex(indexName): Promise<number> {
    const res = await this.redisClient
      .multi()
      .incr(indexName)
      .get(indexName)
      .exec();

    return Number(res[0][1]);
  }
}
