import 'jest';

import { TodoStorage } from './storage';
import { Todo } from '../../todos/interfaces/todo.interface';

describe('Storage Util', () => {
  let storage: TodoStorage;

  beforeAll(async () => {
    storage = new TodoStorage();
  });

  describe('Todo', () => {
    it('should set and get same value', async () => {
      const todo: Todo = {
        id: 1,
        text: 'test',
        references: [1, 2],
        createdAt: new Date()
      }

      await storage.set('testKey', todo);
      const res = await storage.get('testKey');

      expect(JSON.stringify(res)).toEqual(JSON.stringify(todo));
    });

    it('should resist race condition on todoIndex', async () => {
      const res = await Promise.all([
        storage.getTodoIndex(),
        storage.getTodoIndex(),
        storage.getTodoIndex(),
        storage.getTodoIndex(),
        storage.getTodoIndex(),
        storage.getTodoIndex(),
        storage.getTodoIndex()
      ]);

      expect( (new Set(res)).size ).toEqual(res.length);
    });

  });
})
