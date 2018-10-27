import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Todo } from './interfaces/todo.interface';
import { TodosService } from './todos.service';
import { CreateTodoValidator } from './validators/create-todo.validator';
import { UpdateTodoValidator } from './validators/update-todo.validator';

interface ResponseWrapper<T> {
  metadata?: any;
  data: T;
}

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() createTodoBody: CreateTodoValidator,
  ): Promise<ResponseWrapper<Todo>> {
    let todo: Todo = {
      ...createTodoBody,
      createdAt: new Date(),
    };

    const data = await this.todosService.create(todo);

    return {
      data,
    };
  }

  @Get()
  async find(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<ResponseWrapper<Todo[]>> {
    offset = Number(offset || 0);
    limit = Number(limit || 5);

    const count = await this.todosService.count();
    const data = await this.todosService.find(offset, limit);

    return {
      metadata: {
        count,
      },
      data,
    };
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    await this.todosService.update(id, updateTodoBody);
  }

  @Patch(':id')
  @HttpCode(200)
  async complete(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    await this.todosService.patch(id, updateTodoBody);
  }
}
