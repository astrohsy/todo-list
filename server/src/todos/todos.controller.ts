import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodosService } from './todos.service';
import { CreateTodoValidator } from './validators/create-todo.validator';
import { UpdateTodoValidator } from './validators/update-todo.validator';

interface ResponseWrapper<T> {
  metadata?: any,
  data: T
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createTodoBody: CreateTodoValidator): Promise< ResponseWrapper<Todo> > {
    let todo: Todo = {
      ...createTodoBody,
      createdAt: new Date(),
    };

    const res = await this.todosService.create(todo);
    if (res == null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Wrong Reference',
        },
        400,
      );
    }

    return {
      data: res
    }
  }

  @Get()
  async find(@Query('offset') offset, @Query('limit') limit): Promise< ResponseWrapper<Todo[]> > {
    offset = offset || 0;
    limit = limit || 5;

    return {
      metadata: {
        count: await this.todosService.count()
      },
      data: await this.todosService.find(offset, limit)
    }
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    updateTodoBody.id = id;
    this.todosService.update(updateTodoBody)
  }

  @Patch(':id')
  @HttpCode(200)
  async complete(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    this.todosService.patch(id, updateTodoBody);
  }
}
