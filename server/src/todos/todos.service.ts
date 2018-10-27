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
          response: '참조하는 Todo 중 존재하지 않는 Todo id가 있습니다.',
        },
        400,
      );
    }

    /* Issue new Id */
    todo.id = await this.storage.getIndex(redisIndexKey);
    await this.updateTodo(todo.id, todo);

    return todo;
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
    /* Case 1: check references are exist */
    const references = await Promise.all(
      todo.references.map(async value => {
        return this.storage.get(redisKey, value);
      }),
    );

    if (references.some((v) => v == null)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          response: '참조하는 Todo 중 존재하지 않는 Todo id가 있습니다.',
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

    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;
    await this.updateTodo(id, todo, oldTodo);
  }

  async patch(id, todo: Partial<Todo>) {
    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;

    /* Check if all the references are completed */
    const isCheckable = await this.graph.shouldBeCompleted(id);
    if (!isCheckable) {
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

    await this.completeTodo(newTodo.id, newTodo);
  }

  async count(): Promise<number> {
    return await this.storage.getGroupSize(redisKey);
  }

  private async updateTodo(
    todoId: number,
    newTodo: Todo,
    oldTodo?: Todo,
  ): Promise<void> {
    if (oldTodo) {
      await Promise.all(
        oldTodo.references.map(async value => {
          return this.graph.unsetEdge(todoId, value);
        }),
      )
    }

    await Promise.all(
      newTodo.references.map(async value => {
        return this.graph.setEdge(todoId, value);
      }),
    );

    await this.storage.set(redisKey, todoId, newTodo);
  }

  private async completeTodo(
    todoId: number,
    newTodo: Todo,
  ): Promise<void> {

    await this.graph.setComplete(todoId);
    await this.storage.set(redisKey, todoId, newTodo);
  }
}
