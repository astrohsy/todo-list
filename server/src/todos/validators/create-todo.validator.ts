import { IsArray, IsString, MinLength, IsDateString } from 'class-validator';

export class CreateTodoValidator {
  @IsString()
  @MinLength(1)
  readonly text: string;

  @IsDateString()
  readonly createdAt: Date;

  @IsArray()
  readonly references: number[];
}
