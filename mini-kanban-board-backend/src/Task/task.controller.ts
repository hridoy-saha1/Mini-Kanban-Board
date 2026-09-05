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

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../User/guards/jwt-auth.guard';
import { MoveTaskDto } from './dto/move-task.dto';

@Controller('columns/:columnId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
  ) {}

  @Post()
  create(
    @Param('columnId') columnId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ) {
    return this.taskService.create(
      columnId,
      req.user.userId,
      createTaskDto,
    );
  }

  @Get()
  findAll(
    @Param('columnId') columnId: string,
    @Req() req: any,
  ) {
    return this.taskService.findAll(
      columnId,
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('columnId') columnId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.taskService.findOne(
      id,
      columnId,
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('columnId') columnId: string,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.taskService.update(
      id,
      columnId,
      req.user.userId,
      updateTaskDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('columnId') columnId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.taskService.remove(
      id,
      columnId,
      req.user.userId,
    );
  }

  //move 
  @Patch(':id/move')
move(
  @Param('columnId') columnId: string,
  @Param('id') id: string,
  @Body() moveTaskDto: MoveTaskDto,
  @Req() req: any,
) {
  return this.taskService.move(
    id,
    columnId,
    req.user.userId,
    moveTaskDto.targetColumnId,
    moveTaskDto.targetOrder,
  );
}
}