import { IsArray, IsString, IsInt, IsDate } from 'class-validator';

export class UpdateTodoValidator {
  @IsString()
  readonly text: string;

  @IsArray()
  readonly references: number[];

  @IsInt()
  readonly id: number;

  @IsDate()
  readonly createdAt: Date;

  @IsDate()
  readonly updatedAt: Date;

  @IsDate()
  readonly completedAt: Date;
}
