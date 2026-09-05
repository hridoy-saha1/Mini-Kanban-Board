import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Column } from './entities/column.entity';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { BoardModule } from '../Board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    BoardModule,
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
   exports: [ColumnService],
})
export class ColumnModule {}