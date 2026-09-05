import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Task } from './entities/task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ColumnModule } from '../Column/column.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    ColumnModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}