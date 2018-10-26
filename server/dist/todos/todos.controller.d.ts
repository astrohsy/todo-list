import { Todo } from './interfaces/todo.interface';
import { TodosService } from './todos.service';
import { CreateTodoValidator } from './validators/create-todo.validator';
import { UpdateTodoValidator } from './validators/update-todo.validator';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    create(createTodoBody: CreateTodoValidator): Promise<void>;
    findAll(): Promise<Todo[]>;
    update(id: any, updateTodoBody: UpdateTodoValidator): Promise<void>;
    remove(id: any): Promise<void>;
}
