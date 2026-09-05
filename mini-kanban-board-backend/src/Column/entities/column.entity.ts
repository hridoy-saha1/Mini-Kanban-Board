import {
  Column as TypeOrmColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('columns')
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn('uuid')
  boardId: string;

  @TypeOrmColumn({ length: 100 })
  title: string;

  @TypeOrmColumn('int')
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}