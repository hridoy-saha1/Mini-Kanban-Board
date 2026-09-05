import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { BoardShare } from './entities/board-share.entity';
import { User } from '../User/Entities/user.entity';

@Module({
  imports: [   TypeOrmModule.forFeature([
      Board,
      BoardShare,
      User,
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [BoardController],
  providers: [BoardService],
   exports: [BoardService],
})
export class BoardModule {}