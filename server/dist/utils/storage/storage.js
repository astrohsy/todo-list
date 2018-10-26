"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const group = 'todo';
class Storage {
    constructor() {
        this.redisClient = Redis.prototype;
        if (process.env.NODE_ENV !== 'test') {
            this.redisClient = new Redis();
        }
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const convertedValue = JSON.stringify(value);
            yield this.redisClient.hset(group, key, convertedValue);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = JSON.parse(yield this.redisClient.hget(group, key));
            return res;
        });
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map