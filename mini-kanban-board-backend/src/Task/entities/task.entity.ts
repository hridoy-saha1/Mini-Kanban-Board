import {
  Column as TypeOrmColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn('uuid')
  columnId: string;

  @TypeOrmColumn({ length: 200 })
  title: string;

  @TypeOrmColumn('text', { nullable: true })
  description: string | null;

  @TypeOrmColumn('int')
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}