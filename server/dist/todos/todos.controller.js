"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const todos_service_1 = require("./todos.service");
const create_todo_validator_1 = require("./validators/create-todo.validator");
const update_todo_validator_1 = require("./validators/update-todo.validator");
let TodosController = class TodosController {
    constructor(todosService) {
        this.todosService = todosService;
    }
    create(createTodoBody) {
        return __awaiter(this, void 0, void 0, function* () {
            this.todosService.create(createTodoBody);
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.todosService.findAll();
        });
    }
    update(id, updateTodoBody) {
        return __awaiter(this, void 0, void 0, function* () {
            this.todosService.update(updateTodoBody);
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.todosService.delete(id);
        });
    }
};
__decorate([
    common_1.Post(),
    common_1.HttpCode(204),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_todo_validator_1.CreateTodoValidator]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "create", null);
__decorate([
    common_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "findAll", null);
__decorate([
    common_1.Put(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_todo_validator_1.UpdateTodoValidator]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "update", null);
__decorate([
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodosController.prototype, "remove", null);
TodosController = __decorate([
    common_1.Controller('todos'),
    __metadata("design:paramtypes", [todos_service_1.TodosService])
], TodosController);
exports.TodosController = TodosController;
//# sourceMappingURL=todos.controller.js.map