import 'jest';

import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis';

import { TodosService } from './todos.service';
import { Todo } from './interfaces/todo.interface';

describe('TodosService', () => {
  let service: TodosService;
  let redisClient = Redis.prototype;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService],
    }).compile();
    service = module.get<TodosService>(TodosService);
  });

  describe('create', () => {
    const item: Todo = {
      text: 'test1',
      references: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    }

    it('should create todo', () => {
      jest.spyOn(redisClient, 'get').mockImplementation(() => 1);
      const mockSet = jest.spyOn(redisClient, 'set').mockImplementation(() => {});

      service.create(item)
      expect(mockSet).toHaveBeenCalledWith(
        'todo#1',
        JSON.stringify(item)
      );
    });

    it('should not create todo with invalid reference', () => {
      jest.spyOn(redisClient, 'get').mockImplementation((key) => {
        if (key === 'todoIndex') {
          return new Promise( (resolve, reject) => resolve(1));
        } else {
          // When referenced todo is not exist
          return new Promise( (resolve, reject) => reject('no key has set'));
        }
      });
      const mockSet = jest.spyOn(redisClient, 'set').mockImplementation(() => {});

      service.create(item)
      // It should not be called
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('should create todo with unique reference numbers', () => {
      jest.spyOn(redisClient, 'get').mockImplementation((key) => {
        if (key === 'todoIndex') {
          return new Promise( (resolve, reject) => resolve(1));
        } else {
          // All todos are exist
          return new Promise( (resolve, reject) => reject('no key has set'));
        }
      });
      const mockSet = jest.spyOn(redisClient, 'set').mockImplementation(() => {});

      const itemWithDuplicateReferences: Todo = {
        text: 'test1',
        references: [1, 1, 2, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };

      const expectedItem: Todo = {
        text: 'test1',
        references: [1, 2, 3],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      };

      service.create(itemWithDuplicateReferences);
      expect(mockSet).toHaveBeenCalledWith(
        'item#1',
        JSON.stringify(expectedItem)
      );
    });
  });
});
