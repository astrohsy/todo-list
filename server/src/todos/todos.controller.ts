import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodosService } from './todos.service';
import { CreateTodoValidator } from './validators/create-todo.validator';
import { UpdateTodoValidator } from './validators/update-todo.validator';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(204)
  async create(@Body() createTodoBody: CreateTodoValidator) {
    let todo: Todo = {
      ...createTodoBody,
      createdAt: new Date()
    };

    this.todosService.create(todo);
  }

  @Get()
  async findAll(): Promise<Todo[]> {
    return this.todosService.findAll();
  }

  @Put(':id')
  async update(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    this.todosService.update(updateTodoBody);
  }

  @Delete(':id')
  async remove(@Param('id') id) {
    this.todosService.delete(id);
  }
}
