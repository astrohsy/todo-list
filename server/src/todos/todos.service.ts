import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodoStorage } from '../utils/storage/storage';
import { redisKey, redisIndexKey } from './contants/todos.contants';
import { Graph } from '../utils/graph/graph';

@Injectable()
export class TodosService {
  private readonly storage: TodoStorage;
  private readonly graph: Graph;

  constructor() {
    this.storage = new TodoStorage();
    this.graph = new Graph();
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
      const id = await this.storage.getIndex(redisIndexKey);
      newTodo.id = Number(id);

      await this.updateGraph(newTodo.id, newTodo.references);
      await this.storage.set(redisKey, newTodo.id, newTodo);

      return newTodo;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response:
            '참조하는 Todo 중 존재하지 않는 Todo id가 있습니다.',
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

  async update(id: number, todo: Todo) {

    /* Case 1: Reference is not exist */
    const references = await Promise.all(
      todo.references.map(async value => {
        return this.storage.get(redisKey, value);
      }),
    );

    if (references.filter(v => v == null).length !== 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response:
            '참조하는 Todo 중 존재하지 않는 Todo id가 있습니다.',
        },
        400,
      );
    }

    /* Case 2: Cycle check */
    if (await this.graph.willBeCycle(id, todo.references)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response:
            '참조가 걸린 Todo에 사이클 발생으로 완료 불가능한 구조입니다.',
        },
        400,
      );
    }

    todo.updatedAt = new Date();
    await this.updateGraph(id, todo.references);
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

      if (now === id) {
        nowTodo.references.forEach(next => {
          if (V[next] !== true) {
            queue.push(next);
            V[next] = true;
          }
        });
      } else if (nowTodo.completedAt) {
        continue;
      } 
      else {
        hasNotChecked = true;
        break;
      }
    }

    if (hasNotChecked) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: '참조가 걸린 Todo 중 완료가 안된 Todo가 있습니다.',
        },
        400,
      );
    }

    // Can not update complete time, once it had been completed
    if (!(oldTodo.completedAt == null && todo.completedAt !== null)) {
      return null;
    }

    const newTodo = Object.assign(oldTodo, todo);

    await this.graph.setComplete(id);
    return await this.storage.set(redisKey, id, newTodo);
  }

  async count() {
    return await this.storage.getGroupSize(redisKey);
  }

  private async updateGraph(vertex: number, references: number[]): Promise<void> {
    await Promise.all(
      references.map(async value => {
        return this.graph.setEdge(vertex, value);
      })
    );
  }
}
