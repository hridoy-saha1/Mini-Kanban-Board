import {
    ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/create-board.dto';
import { BoardShare } from './entities/board-share.entity';
import { User } from '../User/Entities/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardShare)
  private readonly boardShareRepository: Repository<BoardShare>,
   @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createBoardDto: CreateBoardDto,
    ownerId: string,
  ) {
    const board = this.boardRepository.create({
      title: createBoardDto.title,
      description: createBoardDto.description,
      ownerId,
    });

    return this.boardRepository.save(board);
  }

async findAll(userId: string) {
  const ownedBoards = await this.boardRepository.find({
    where: {
      ownerId: userId,
    },
    order: {
      createdAt: 'DESC',
    },
  });

  const sharedBoards = await this.boardShareRepository.find({
    where: {
      userId,
    },
  });

  if (sharedBoards.length === 0) {
    return ownedBoards;
  }

  const sharedBoardIds = sharedBoards.map(
    (share) => share.boardId,
  );

  const sharedBoardData = await this.boardRepository
    .createQueryBuilder('board')
    .where('board.id IN (:...ids)', {
      ids: sharedBoardIds,
    })
    .orderBy('board.createdAt', 'DESC')
    .getMany();

  return [...ownedBoards, ...sharedBoardData];
}

 async findOne(id: string, userId: string) {
  // Check if user owns the board
  const ownedBoard = await this.boardRepository.findOne({
    where: {
      id,
      ownerId: userId,
    },
  });

  if (ownedBoard) {
    return ownedBoard;
  }

  // Check if board is shared with the user
  const sharedBoard = await this.boardShareRepository.findOne({
    where: {
      boardId: id,
      userId,
    },
  });

  if (!sharedBoard) {
    throw new NotFoundException('Board not found');
  }

  const board = await this.boardRepository.findOne({
    where: {
      id,
    },
  });

  if (!board) {
    throw new NotFoundException('Board not found');
  }

  return board;
}

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    ownerId: string,
  ) {
    const board = await this.findOne(id, ownerId);

    Object.assign(board, updateBoardDto);

    return this.boardRepository.save(board);
  }

  async remove(id: string, ownerId: string) {
    const board = await this.findOne(id, ownerId);

    await this.boardRepository.remove(board);

    return {
      message: 'Board deleted successfully',
    };
  }

async shareBoard(
  boardId: string,
  ownerId: string,
  email: string,
) {
  // Check board ownership
  const board = await this.boardRepository.findOne({
    where: {
      id: boardId,
      ownerId,
    },
  });

  if (!board) {
    throw new NotFoundException('Board not found');
  }

  // Find user by email
  const user = await this.userRepository.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Owner cannot share board with himself
  if (user.id === ownerId) {
    throw new ConflictException(
      'Board owner already has access',
    );
  }

  // Check existing share
  const existingShare = await this.boardShareRepository.findOne({
    where: {
      boardId,
      userId: user.id,
    },
  });

  if (existingShare) {
    throw new ConflictException(
      'Board already shared with this user',
    );
  }

  // Create share
  const boardShare = this.boardShareRepository.create({
    boardId,
    userId: user.id,
  });

  const savedShare =
    await this.boardShareRepository.save(boardShare);

  return {
    message: 'Board shared successfully',
    share: savedShare,
  };
}

}