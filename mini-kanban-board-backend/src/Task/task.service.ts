import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ColumnService } from '../Column/column.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly columnService: ColumnService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    columnId: string,
    userId: string,
    createTaskDto: CreateTaskDto,
  ) {
    await this.columnService.getAccessibleColumn(columnId, userId);

    const task = this.taskRepository.create({
      columnId,
      title: createTaskDto.title,
      description: createTaskDto.description,
      order: createTaskDto.order ?? 0,
    });

    return this.taskRepository.save(task);
  }

  async findAll(columnId: string, userId: string) {
    await this.columnService.getAccessibleColumn(columnId, userId);

    return this.taskRepository.find({
      where: { columnId },
      order: { order: 'ASC' },
    });
  }

  async findOne(
    id: string,
    columnId: string,
    userId: string,
  ) {
    await this.columnService.getAccessibleColumn(
      columnId,
      userId,
    );

    const task = await this.taskRepository.findOne({
      where: { id, columnId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    columnId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.findOne(
      id,
      columnId,
      userId,
    );

    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(
    id: string,
    columnId: string,
    userId: string,
  ) {
    const task = await this.findOne(
      id,
      columnId,
      userId,
    );

    await this.taskRepository.remove(task);

    return {
      message: 'Task deleted successfully',
    };
  }

// task move

async move(
  id: string,
  sourceColumnId: string,
  userId: string,
  targetColumnId: string,
  targetOrder: number,
) {
  return this.dataSource.transaction(async (manager) => {
    const taskRepository = manager.getRepository(Task);

    const sourceColumn =
      await this.columnService.getAccessibleColumn(
        sourceColumnId,
        userId,
      );

    const targetColumn =
      await this.columnService.getAccessibleColumn(
        targetColumnId,
        userId,
      );

    const task = await taskRepository.findOne({
      where: {
        id,
        columnId: sourceColumn.id,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const oldOrder = task.order;

    if (sourceColumn.id === targetColumn.id) {
      if (oldOrder < targetOrder) {
        await manager
          .createQueryBuilder()
          .update(Task)
          .set({
            order: () => '"order" - 1',
          })
          .where('"columnId" = :columnId', {
            columnId: sourceColumn.id,
          })
          .andWhere('"order" > :oldOrder', {
            oldOrder,
          })
          .andWhere('"order" <= :targetOrder', {
            targetOrder,
          })
          .execute();
      } else if (oldOrder > targetOrder) {
        await manager
          .createQueryBuilder()
          .update(Task)
          .set({
            order: () => '"order" + 1',
          })
          .where('"columnId" = :columnId', {
            columnId: sourceColumn.id,
          })
          .andWhere('"order" >= :targetOrder', {
            targetOrder,
          })
          .andWhere('"order" < :oldOrder', {
            oldOrder,
          })
          .execute();
      }
    } else {
      await manager
        .createQueryBuilder()
        .update(Task)
        .set({
          order: () => '"order" - 1',
        })
        .where('"columnId" = :columnId', {
          columnId: sourceColumn.id,
        })
        .andWhere('"order" > :oldOrder', {
          oldOrder,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .update(Task)
        .set({
          order: () => '"order" + 1',
        })
        .where('"columnId" = :columnId', {
          columnId: targetColumn.id,
        })
        .andWhere('"order" >= :targetOrder', {
          targetOrder,
        })
        .execute();
    }

    task.columnId = targetColumn.id;
    task.order = targetOrder;

    await taskRepository.save(task);

    return task;
  });
}

}