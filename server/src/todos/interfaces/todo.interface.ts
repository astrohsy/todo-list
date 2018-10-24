export interface Todo {
  text: string;
  references: number[];
  id?: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}
