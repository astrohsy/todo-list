import { IsArray, IsString } from 'class-validator';

export class CreateTodoValidator {
  @IsString()
  readonly text: string;

  @IsArray()
  readonly references: number[];
}
