import { Injectable } from '@nestjs/common';
import * as Redis from "ioredis";

import { Todo } from './interfaces/todo.interface';

@Injectable()
export class TodosService {
  private readonly todos: Todo[] = [];
  private readonly redisClient: Redis.Redis;

  constructor() {

    if (process.env.NODE_ENV === 'test') {
      // Allow mocking
      this.redisClient = Redis.prototype;
    } else {
      // Connect to a real redis server
      this.redisClient = new Redis();
    }

  }

  create(todo: Todo) {
    this.redisClient.set('1', '2');
    this.todos.push(todo);
  }

  findAll(): Todo[] {
    return this.todos;
  }

  update(todo: Todo) {
    // TODO: implement update
  }

  delete(id: number) {
    // TODO: implement delete
  }
}
