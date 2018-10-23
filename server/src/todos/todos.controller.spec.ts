import 'jest';

import { Test } from '@nestjs/testing';

import { Todo } from './interfaces/todo.interface';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

describe('Todos Controller', () => {
  let todosService: TodosService;
  let todosController: TodosController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [TodosService]
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    todosController = module.get<TodosController>(TodosController);
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const item: Todo = {
        text: 'test1',
        references: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      }

      const result: Array<Todo> = [item];
      jest.spyOn(todosService, 'findAll').mockImplementation(() => result);

      expect(await todosController.findAll()).toBe(result);
    });

    it('should return an empty array on no todos', async () => {
      const result: Array<Todo> = [];
      jest.spyOn(todosService, 'findAll').mockImplementation(() => result);

      expect(await todosController.findAll()).toBe(result);
    });
  });
});
