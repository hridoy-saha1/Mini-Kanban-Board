import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Column } from './entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { BoardService } from '../Board/board.service';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
      private readonly boardService: BoardService,
  ) {}


async getAccessibleColumn(
  id: string,
  userId: string,
) {
  const column = await this.columnRepository.findOne({
    where: { id },
  });

  if (!column) {
    throw new NotFoundException('Column not found');
  }

  await this.boardService.findOne(
    column.boardId,
    userId,
  );

  return column;
}


async create(
  boardId: string,
  userId: string,
  createColumnDto: CreateColumnDto,
) {
  await this.boardService.findOne(boardId, userId);

  const column = this.columnRepository.create({
    boardId,
    title: createColumnDto.title,
    order: createColumnDto.order ?? 0,
  });

  return this.columnRepository.save(column);
}
async findAll(boardId: string, userId: string) {
  await this.boardService.findOne(boardId, userId);

  return this.columnRepository.find({
    where: { boardId },
    order: { order: 'ASC' },
  });
}

 async findOne(id: string, boardId: string, userId: string) {
  await this.boardService.findOne(boardId, userId);

  const column = await this.columnRepository.findOne({
    where: {
      id,
      boardId,
    },
  });

  if (!column) {
    throw new NotFoundException('Column not found');
  }

  return column;
}

async update(
  id: string,
  boardId: string,
  userId: string,
  updateColumnDto: UpdateColumnDto,
) {
  const column = await this.findOne(id, boardId, userId);

  Object.assign(column, updateColumnDto);

  return this.columnRepository.save(column);
}

async remove(
  id: string,
  boardId: string,
  userId: string,
) {
  const column = await this.findOne(id, boardId, userId);

  await this.columnRepository.remove(column);

  return {
    message: 'Column deleted successfully',
  };
}
}