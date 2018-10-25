import { Injectable } from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodoStorage } from '../utils/storage/storage';
import { redisKey } from './contants/todos.contants';

@Injectable()
export class TodosService {
  private readonly todos: Todo[] = [];
  private readonly storage: TodoStorage;

  constructor() {
    this.storage = new TodoStorage();
  }

  async create(todo: Todo): Promise<Todo> {
    const newTodo: Todo = {
      ...todo
    };

    /* Case 1: has duplicate references */
    newTodo.references = newTodo.references.filter((v, i, a) => a.indexOf(v) === i); 

    /* Case 2: Reference is not exist */
    const references = await Promise.all(
      newTodo.references.map(async (value) => {
        return this.storage.get(redisKey, value);
      })
    )

    if (references.filter((v) => v == null).length === 0) {
      /* Issue new Id */
      const id = await this.storage.getTodoIndex();
      newTodo.id = Number(id);

      await this.storage.set(redisKey, newTodo.id, newTodo);
      return newTodo;
    } else {
      return null;
    }
  }

  async findAll(): Promise<Todo[]> {
    return this.todos;
  }

  async update(todo: Todo) {
    // TODO: implement update
  }

  async delete(id: number) {
    // TODO: implement delete
  }
}
