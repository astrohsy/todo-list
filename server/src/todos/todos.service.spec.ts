import 'jest';

import { Test, TestingModule } from '@nestjs/testing';

import { TodosService } from './todos.service';
import { Todo } from './interfaces/todo.interface';
import { TodoStorage } from '../utils/storage/storage';
import { redisKey } from './contants/todos.contants';

describe('TodosService', () => {
  let service: TodosService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService],
    }).compile();
    service = module.get<TodosService>(TodosService);
  });

  describe('create', () => {
    it('should create todo', async () => {
      let mockTodoIndex = 0;

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementationOnce(
        jest.fn(() => {
          return Promise.resolve(1);
        }),
      );

      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementationOnce(
        jest.fn(() => {
          return Promise.resolve();
        }),
      );

      const getTodoIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getTodoIndex',
      );
      getTodoIndexMock.mockImplementationOnce(
        jest.fn(() => {
          mockTodoIndex += 1;
          return Promise.resolve(mockTodoIndex);
        }),
      );

      const item: Todo = {
        text: 'test',
        references: [1],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      await service.create(item);

      item.id = mockTodoIndex;
      expect(setMock).toHaveBeenCalledWith(redisKey, mockTodoIndex, item);
    });

    it('should not create todo with invalid reference', async () => {
      let mockTodoIndex = 0;

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          if (key === 3) Promise.reject('invalid key');
          else return Promise.resolve(key);
        }),
      );

      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementation(
        jest.fn(() => {
          return Promise.resolve();
        }),
      );
      setMock.mockClear();

      const getTodoIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getTodoIndex',
      );
      getTodoIndexMock.mockImplementation(
        jest.fn(() => {
          mockTodoIndex += 1;
          return Promise.resolve(mockTodoIndex);
        }),
      );

      // Reference id: 3 is invalid
      const item: Todo = {
        text: 'test',
        references: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      expect(await service.create(item)).toEqual(null);
      expect(setMock).not.toHaveBeenCalled();
    });

    it('should create todo with unique reference numbers', async () => {
      let mockTodoIndex = 0;

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementationOnce(
        jest.fn(() => {
          return Promise.resolve(1);
        }),
      );

      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementationOnce(
        jest.fn(() => {
          return Promise.resolve();
        }),
      );

      const getTodoIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getTodoIndex',
      );
      getTodoIndexMock.mockImplementationOnce(
        jest.fn(() => {
          mockTodoIndex += 1;
          return Promise.resolve(mockTodoIndex);
        }),
      );

      const item: Todo = {
        text: 'test',
        references: [1, 1, 1, 2, 2, 2],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      await service.create(item);

      item.id = mockTodoIndex;
      item.references = item.references.filter((v, i, a) => a.indexOf(v) === i);
      expect(setMock).toHaveBeenCalledWith(redisKey, mockTodoIndex, item);
    });
  });
});
