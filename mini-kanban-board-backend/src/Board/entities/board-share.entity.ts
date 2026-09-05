import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('board_shares')
@Unique(['boardId', 'userId'])
export class BoardShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  boardId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}