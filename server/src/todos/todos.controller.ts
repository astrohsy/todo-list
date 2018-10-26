import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Patch,
} from '@nestjs/common';

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

    return res;
  }

  @Get()
  async find(
    @Query('offset') offset,
    @Query('limit') limit
  ) : Promise<Todo[]> {
    offset = offset || 0;
    limit = limit || 5;

    return this.todosService.find(offset, limit);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    updateTodoBody.id = id;
    return this.todosService.update(updateTodoBody);
  }

  @Patch(':id')
  @HttpCode(200)
  async complete(@Param('id') id, @Body() updateTodoBody: UpdateTodoValidator) {
    return this.todosService.patch(id, updateTodoBody);
  }

}
