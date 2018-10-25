import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodosService } from './todos.service';
import { CreateTodoValidator } from './validators/create-todo.validator';
import { UpdateTodoValidator } from './validators/update-todo.validator';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createTodoBody: CreateTodoValidator) {
    let todo: Todo = {
      ...createTodoBody,
      createdAt: new Date()
    };

    const res = await this.todosService.create(todo);
    if (res == null) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Wrong Reference',
      }, 400);
    }

    return res;
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
