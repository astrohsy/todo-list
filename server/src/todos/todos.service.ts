import { Injectable } from '@nestjs/common';
import { Todo } from './interfaces/todo.interface';

@Injectable()
export class TodosService {
  private readonly todos: Todo[] = [];

  create(todo: Todo) {
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
