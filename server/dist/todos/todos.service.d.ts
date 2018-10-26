import { Todo } from './interfaces/todo.interface';
export declare class TodosService {
    private readonly todos;
    private readonly redisClient;
    constructor();
    create(todo: Todo): void;
    findAll(): Todo[];
    update(todo: Todo): void;
    delete(id: number): void;
}
