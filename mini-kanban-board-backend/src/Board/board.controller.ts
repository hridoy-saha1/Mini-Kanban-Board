import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/create-board.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';
import { ShareBoardDto } from './dto/share-board.dto';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
  ) {}

  @Post()
  create(
    @Body() createBoardDto: CreateBoardDto,
    @Req() req: any,
  ) {
    return this.boardService.create(
      createBoardDto,
      req.user.userId,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.boardService.findAll(
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.boardService.findOne(
      id,
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Req() req: any,
  ) {
    return this.boardService.update(
      id,
      updateBoardDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.boardService.remove(
      id,
      req.user.userId,
    );
  }



  @Post(':id/share')
shareBoard(
  @Param('id') id: string,
  @Body() shareBoardDto: ShareBoardDto,
  @Req() req: any,
) {
  return this.boardService.shareBoard(
    id,
    req.user.userId,
    shareBoardDto.email,
  );
}
}