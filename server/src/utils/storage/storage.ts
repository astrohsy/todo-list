import * as Redis from "ioredis";

type Key = string;
type Value = object|string|number;

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

    async set(key: Key, value: Value) {
        const convertedValue = JSON.stringify(value);
        await this.redisClient.set(key, convertedValue);
    }

    async get(key: Key): Promise<Value> {
        const res = JSON.parse(await this.redisClient.get(key));
        return res;
    }

    async getTodoIndex(): Promise<Value> {
        const res =  await this.redisClient.multi()
            .incr('todo-index')
            .get('todo-index')
            .exec();

        return res[0][1];
    }
}
