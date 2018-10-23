export interface Todo {
  readonly text: string;
  readonly references: number[];
  readonly id?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly completedAt?: Date;
}
