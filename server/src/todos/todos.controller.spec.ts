import 'jest';

import { Test, TestingModule } from '@nestjs/testing';

import { TodosController } from './todos.controller';

describe('Todos Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [TodosController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: TodosController = module.get<TodosController>(
      TodosController,
    );
    expect(controller).toBeDefined();
  });
});
