import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './User/user.module';
import { BoardModule } from './Board/board.module';
import { ColumnModule } from './Column/column.module';
import { TaskModule } from './Task/task.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    UserModule,
    BoardModule,
    ColumnModule,
    TaskModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,

      autoLoadEntities: true,
      synchronize: true,

      ssl: {
        rejectUnauthorized: false,
      },
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}