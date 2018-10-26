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
      const testGroup = 'test-group-1';
      const todo: Todo = {
        id: 1,
        text: 'test',
        references: [1, 2],
        createdAt: new Date(),
      };

      await storage.set(testGroup, 1, todo);
      const res = await storage.get(testGroup, 1);

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
        storage.getTodoIndex(),
      ]);

      expect(new Set(res).size).toEqual(res.length);
    });

    it('should return items with given limit and offset', async () => {
      const getRangeTestGroup = 'get-range-test';

      Promise.all(
        Array.from(new Array(30).keys()).map(async value => {
          storage.set(getRangeTestGroup, value, value);
        }),
      );

      const offset = 21;
      const limit = 10;
      const values = await storage.getRange(getRangeTestGroup, offset, limit);
      const expectedValues = [8, 7, 6, 5, 4, 3, 2, 1, 0];
      for (let i = 0; i < limit; i++) {
        expect(values[i]).toEqual(expectedValues[i]);
      }
    });

    it('should return items with given larger beyond its size', async () => {
      const getRangeTestGroup = 'get-range-test2';

      Promise.all(
        Array.from(new Array(10).keys()).map(async value => {
          storage.set(getRangeTestGroup, value, value);
        }),
      );

      const offset = 5;
      const limit = 10;
      const values = await storage.getRange(getRangeTestGroup, offset, limit);
      const expectedValues = [4, 3, 2, 1, 0];
      for (let i = 0; i < limit; i++) {
        expect(values[i]).toEqual(expectedValues[i]);
      }
    });

    it('should return the number of items', async () => {
      const getRangeTestGroup = 'get-range-test';

      Promise.all(
        Array.from(new Array(30).keys()).map(async value => {
          storage.set(getRangeTestGroup, value, value);
        }),
      );

      const size = await storage.getGroupSize(getRangeTestGroup);
      expect(size).toEqual(30);
    });
  });
});
