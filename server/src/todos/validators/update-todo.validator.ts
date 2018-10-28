import {
  IsArray,
  IsDateString,
  IsInt,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateTodoValidator {
  @IsString()
  @MinLength(1)
  readonly text: string;

  @IsArray()
  readonly references: number[];

  @IsInt()
  readonly id: number;

  @IsDateString()
  readonly createdAt: Date;

  @IsDateString()
  readonly updatedAt: Date;

  @IsDateString()
  readonly completedAt: Date;
}
