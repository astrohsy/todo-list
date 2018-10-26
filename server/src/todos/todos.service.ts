import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodoStorage } from '../utils/storage/storage';
import { redisKey } from './contants/todos.contants';
import { Graph } from '../utils/graph/graph';

@Injectable()
export class TodosService {
  private readonly todos: Todo[] = [];
  private readonly storage: TodoStorage;

  constructor() {
    this.storage = new TodoStorage();
  }

  async create(todo: Todo): Promise<Todo> {
    const newTodo: Todo = {
      ...todo,
    };

    /* Case 1: has duplicate references */
    newTodo.references = newTodo.references.filter(
      (v, i, a) => a.indexOf(v) === i,
    );

    /* Case 2: Reference is not exist */
    const references = await Promise.all(
      newTodo.references.map(async value => {
        return this.storage.get(redisKey, value);
      }),
    );

    if (references.filter(v => v == null).length === 0) {
      /* Issue new Id */
      const id = await this.storage.getTodoIndex();
      newTodo.id = Number(id);

      await this.storage.set(redisKey, newTodo.id, newTodo);
      return newTodo;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response:
            '해당 Todo에 참조한 Todo 중에 존재하지 않는 Todo가 있습니다.',
        },
        400,
      );
    }
  }

  async find(offset: number, limit: number): Promise<Todo[]> {
    const res = (await this.storage.getRange(
      redisKey,
      offset,
      limit,
    )) as Todo[];

    return res;
  }

  async update(id, todo: Todo) {
    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;

    /* cycle check */
    const g = new Graph();
    const V = {} as any;
    const queue = [todo.id];

    V[id] = true;
    while (queue.length > 0) {
      const now = queue.shift();
      const nowTodo = (await this.storage.get(redisKey, now)) as Todo;

      if (nowTodo.completedAt == null) {
        nowTodo.references.forEach(next => {
          if (V[next] !== true) {
            g.addEdge(now, next);
            queue.push(next);
            V[next] = true;
          }
        });
      }
    }

    if (g.isCycle()) {
      console.log('==== Cycle ===');
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response:
            '해당 Todo에 참조가 걸린 Todo에 의해 완료 불가능한 구조입니다.',
        },
        400,
      );
    }

    todo.updatedAt = new Date();
    return await this.storage.set(redisKey, todo.id, todo);
  }

  async patch(id, todo: Partial<Todo>) {
    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;

    /* Check if all the references are completed */
    const V = {} as any;
    const queue = [id];

    V[id] = true;
    let hasNotChecked = false;
    while (queue.length > 0) {
      const now = queue.shift();
      const nowTodo = (await this.storage.get(redisKey, now)) as Todo;

      if (now === id || nowTodo.completedAt) {
        nowTodo.references.forEach(next => {
          if (V[next] !== true) {
            queue.push(next);
            V[next] = true;
          }
        });
      } else {
        hasNotChecked = true;
        break;
      }
    }

    if (hasNotChecked) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: '해당 Todo에 참조가 걸린 Todo가 완료가 안되있습니다',
        },
        400,
      );
    }

    // Can not update complete time, once it has been completed
    if (!(oldTodo.completedAt == null && todo.completedAt !== null)) {
      return null;
    }

    const newTodo = Object.assign(oldTodo, todo);

    return await this.storage.set(redisKey, id, newTodo);
  }

  async count() {
    return await this.storage.getGroupSize(redisKey);
  }
}
