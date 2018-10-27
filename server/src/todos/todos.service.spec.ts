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

      const getIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getIndex',
      );
      getIndexMock.mockImplementationOnce(
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

      let error;
      try {
        await service.create(item);
      } catch (e) {
        error = e;
      }

      item.id = mockTodoIndex;
      expect(error).not.toBeDefined();
      expect(setMock).toHaveBeenCalledWith(redisKey, mockTodoIndex, item);
    });

    it('should not create todo with invalid reference', async () => {
      let mockTodoIndex = 0;

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          if (key === 3) Promise.resolve(null);
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

      const getIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getIndex',
      );
      getIndexMock.mockImplementation(
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

      let error;
      try {
        await service.create(item);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
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

      const getIndexMock = jest.spyOn(
        TodoStorage.prototype,
        'getIndex',
      );
      getIndexMock.mockImplementationOnce(
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

      let error;
      try {
        await service.create(item);
      } catch (e) {
        error = e;
      }

      item.id = mockTodoIndex;
      item.references = item.references.filter((v, i, a) => a.indexOf(v) === i);

      expect(error).not.toBeDefined();
      expect(setMock).toHaveBeenCalledWith(redisKey, mockTodoIndex, item);
    });
  });

  describe('find', () => {
    it('should return todos with valid size', async () => {
      const getMock = jest.spyOn(TodoStorage.prototype, 'getRange');
      getMock.mockImplementationOnce(
        jest.fn((group, offset, limit) => {
          const res = Array.from(new Array(offset + limit).keys()).slice(
            offset,
          );
          return Promise.resolve(res);
        }),
      );

      const res = await service.find(11, 20);
      expect(res[0]).toEqual(11);
      expect(res[res.length - 1]).toEqual(30);
    });
  });

  describe('update', () => {
    it('should update without cycle', async () => {
      const testTodos = [
        null,
        {
          text: 'test',
          references: [],
          createdAt: new Date(),
          id: 1,
        },

        {
          text: 'test2',
          references: [3],
          createdAt: new Date(),
          id: 2,
        },

        {
          text: 'test3',
          references: [],
          createdAt: new Date,
          id: 3,
        }
      ] as Todo[];

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          return Promise.resolve(testTodos[key]);
        }),
      );

      let error;
      try {
        const newTodo = Object.assign(testTodos[3], { references: [1] });
        await service.update(3, newTodo)
      } catch (e) {
        error = e;
      }

      expect(error).not.toBeDefined();
    });

    it('should not update on cycle', async () => {
      const testTodos = [
        null,
        {
          text: 'test',
          references: [2],
          createdAt: new Date(),
          id: 1,
        },

        {
          text: 'test2',
          references: [3],
          createdAt: new Date(),
          id: 2,
        },

        {
          text: 'test3',
          references: [],
          createdAt: new Date,
          id: 3,
        }
      ] as Todo[];

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          return Promise.resolve(testTodos[key]);
        }),
      );

      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementation(jest.fn());

      // Add a cycle reference
      const newTodo = Object.assign(testTodos[3], { references: [1] });

      let error;
      try {
        await service.update(3, newTodo)
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      //expect(setMock).toBeCalledWith(redisKey, 3, newTodo);
    });

    it('should not update with invalid todo', async () => {
      const testTodos = [
        null,
        {
          text: 'test',
          references: [],
          createdAt: new Date(),
          id: 1,
        },

        {
          text: 'test2',
          references: [3],
          createdAt: new Date(),
          id: 2,
        },

        {
          text: 'test3',
          references: [],
          createdAt: new Date,
          id: 3,
        }
      ] as Todo[];

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          if (key > testTodos.length) {
            return Promise.reject(null);
          }
          return Promise.resolve(testTodos[key]);
        }),
      );

      // 4, 5 is invalid
      const newTodo = Object.assign(testTodos[3], { references: [2, 3, 4, 5] });

      let error;
      try {
        await service.update(1, newTodo)
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
    });
  });

  describe('patch', () => {
    it('should patch a todo without references', async () => {
      const testTodo = {
        text: 'test',
        references: [],
        createdAt: new Date(),
        id: 1,
      };

      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          return Promise.resolve(testTodo);
        }),
      );

      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementation(jest.fn());
      setMock.mockClear();

      const completedAt: Partial<Todo> = {
        completedAt: new Date()
      };

      let error;
      try {
        await service.patch(testTodo.id, completedAt)
      } catch (e) {
        error = e;
      }

      expect(error).not.toBeDefined();
      expect(setMock).toBeCalled();
    });

    it('should patch a todo with valid references', async () => {
      const testTodos = [
        null,
        {
          text: 'test',
          references: [2],
          createdAt: new Date(),
          id: 1,
        },
        {
          text: 'test',
          references: [],
          createdAt: new Date(),
          completedAt: new Date(),
          id: 2,
        }
      ] as Todo[];
  
      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          return Promise.resolve(testTodos[key]);
        }),
      );
  
      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementation(jest.fn());
  
      const completedAt: Partial<Todo> = {
        completedAt: new Date()
      };
  
      let error;
      try {
        await service.patch(testTodos[1].id, completedAt)
      } catch (e) {
        error = e;
      }
  
      expect(error).not.toBeDefined();
      expect(setMock).toBeCalled();
    });
  
    it('should not patch a todo with invalid references', async () => {
      const testTodos = [
        null,
        {
          text: 'test',
          references: [2],
          createdAt: new Date(),
          id: 1,
        },
        {
          text: 'test',
          references: [],
          createdAt: new Date(),
          // No completedAt has provided
          id: 2,
        }
      ] as Todo[];
  
      const getMock = jest.spyOn(TodoStorage.prototype, 'get');
      getMock.mockImplementation(
        jest.fn((redisGroup, key) => {
          return Promise.resolve(testTodos[key]);
        }),
      );
  
      const setMock = jest.spyOn(TodoStorage.prototype, 'set');
      setMock.mockImplementation(jest.fn());
      setMock.mockClear();
  
      const completedAt: Partial<Todo> = {
        completedAt: new Date()
      };
  
      let error;
      try {
        await service.patch(testTodos[1].id, completedAt)
      } catch (e) {
        error = e;
      }
  
      expect(error).toBeDefined();
      expect(setMock).not.toBeCalled();
    });
  });
});
