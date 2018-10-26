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
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class UpdateTodoValidator {
}
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateTodoValidator.prototype, "text", void 0);
__decorate([
    class_validator_1.IsArray(),
    __metadata("design:type", Array)
], UpdateTodoValidator.prototype, "references", void 0);
__decorate([
    class_validator_1.IsInt(),
    __metadata("design:type", Number)
], UpdateTodoValidator.prototype, "id", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], UpdateTodoValidator.prototype, "createdAt", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], UpdateTodoValidator.prototype, "updatedAt", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], UpdateTodoValidator.prototype, "completedAt", void 0);
exports.UpdateTodoValidator = UpdateTodoValidator;
//# sourceMappingURL=update-todo.validator.js.map