declare type Key = string;
declare type Value = object | string | number;
export declare class Storage {
    private readonly redisClient;
    private readonly hash;
    constructor();
    set(key: Key, value: Value): Promise<void>;
    get(key: Key): Promise<Value>;
}
export {};
