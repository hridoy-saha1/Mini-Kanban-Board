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

import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';

@Controller('boards/:boardId/columns')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(
    private readonly columnService: ColumnService,
  ) {}

 
 @Post()
create(
  @Param('boardId') boardId: string,
  @Body() createColumnDto: CreateColumnDto,
  @Req() req: any,
) {
  return this.columnService.create(
    boardId,
    req.user.userId,
    createColumnDto,
  );
}


  @Get()
findAll(
  @Param('boardId') boardId: string,
  @Req() req: any,
) {
  return this.columnService.findAll(
    boardId,
    req.user.userId,
  );
}

 @Get(':id')
findOne(
  @Param('boardId') boardId: string,
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.columnService.findOne(
    id,
    boardId,
    req.user.userId,
  );
}

@Patch(':id')
update(
  @Param('boardId') boardId: string,
  @Param('id') id: string,
  @Body() updateColumnDto: UpdateColumnDto,
  @Req() req: any,
) {
  return this.columnService.update(
    id,
    boardId,
    req.user.userId,
    updateColumnDto,
  );
}

@Delete(':id')
remove(
  @Param('boardId') boardId: string,
  @Param('id') id: string,
  @Req() req: any,
) {
  return this.columnService.remove(
    id,
    boardId,
    req.user.userId,
  );
}
}