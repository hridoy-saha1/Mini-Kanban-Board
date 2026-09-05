import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './User/user.module';
import { BoardModule } from './Board/board.module';
import { ColumnModule } from './Column/column.module';
import { TaskModule } from './Task/task.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [UserModule,BoardModule,ColumnModule,TaskModule,
    TypeOrmModule.forRoot(
{ type: 'postgres',
host: 'localhost',
port: 5432,
username: 'postgres',
password: 'hridoy',
database: 'kanban_db',
autoLoadEntities: true,
synchronize: true,
} ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
