import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Graph } from '../utils/graph/graph';
import { TodoStorage } from '../utils/storage/storage';
import { redisIndexKey, redisKey } from './contants/todos.environments';
import * as ErrorMessages from './contants/todos.messages';
import { Todo } from './interfaces/todo.interface';

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

    if (references.some(v => v == null)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.REFERENCES_TODO_IS_NOT_EXIST,
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

  async update(id: number, todo: Todo): Promise<Todo> {
    /* Case 1: check self-referencing */

    if (todo.references.some(v => v == id)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.TODO_REFERENCE_ITSELF,
        },
        400,
      );
    }
    /* Case 2: check references are exist */
    const references = await Promise.all(
      todo.references.map(async value => {
        return this.storage.get(redisKey, value);
      }),
    );

    if (references.some(v => v == null)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.REFERENCES_TODO_IS_NOT_EXIST,
        },
        400,
      );
    }

    /* Case 3: Cycle check */
    if (await this.graph.willBeCycle(id, todo.references)) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.WILL_BE_CYCLE_WITH_TODO,
        },
        400,
      );
    }

    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;

    return this.updateTodo(id, todo, oldTodo);
  }

  async patch(id: number, todo: Partial<Todo>): Promise<Todo> {
    const oldTodo = (await this.storage.get(redisKey, id)) as Todo;

    /* Handle uncheck request */
    if (Object.keys(todo).length === 1 && todo.completedAt == null) {
      const isUncheckable = await this.graph.shouldBeUncompleted(id);

      if (!isUncheckable) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: ErrorMessages.DEREFERENCES_TODO_HAS_COMPLETED,
          },
          400,
        );
      }
      const newTodo = Object.assign(oldTodo, todo);
      return this.uncompleteTodo(oldTodo.id, newTodo);
    }

    /* Check if all the references are completed */
    const isCheckable = await this.graph.shouldBeCompleted(id);
    if (!isCheckable) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.REFERENCES_TODO_HAS_UNCOMPLETED,
        },
        400,
      );
    }

    const newTodo = Object.assign(oldTodo, todo);

    return this.completeTodo(newTodo.id, newTodo);
  }

  async count(): Promise<number> {
    return await this.storage.getGroupSize(redisKey);
  }

  private async updateTodo(
    todoId: number,
    newTodo: Todo,
    oldTodo?: Todo,
  ): Promise<Todo> {
    if (oldTodo) {
      await Promise.all(
        oldTodo.references.map(async value => {
          return this.graph.unsetEdge(todoId, value);
        }),
      );
    }

    await Promise.all(
      newTodo.references.map(async value => {
        return this.graph.setEdge(todoId, value);
      }),
    );

    return (this.storage.set(redisKey, todoId, newTodo) as unknown) as Todo;
  }

  private async completeTodo(todoId: number, newTodo: Todo): Promise<Todo> {
    await this.graph.setComplete(todoId);
    return (this.storage.set(redisKey, todoId, newTodo) as unknown) as Todo;
  }

  private async uncompleteTodo(todoId: number, newTodo: Todo): Promise<Todo> {
    await this.graph.unsetComplete(todoId);
    return (this.storage.set(redisKey, todoId, newTodo) as unknown) as Todo;
  }
}
