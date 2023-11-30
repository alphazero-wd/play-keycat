import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';
import { PrismaService } from '../prisma/prisma.service';
import { getCurrentRank } from '../ranks';
import { CreateUserDto, UpdateUserDto } from './dto';
import { determineXPsRequired } from '../xps';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.prisma.user.create({
        data: createUserDto,
      });
      return newUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.UniqueViolation) {
          if (error.message.includes('username'))
            throw new BadRequestException(
              'User with that username already exists',
            );
          if (error.message.includes('email'))
            throw new BadRequestException(
              'User with that email already exists',
            );
        }
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { email },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('User with that email does not exist');
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('User with that id does not exist');
        if (error.code === PrismaError.UniqueViolation) {
          if (error.message.includes('username'))
            throw new BadRequestException(
              'User with that username already exists',
            );
          if (error.message.includes('email'))
            throw new BadRequestException(
              'User with that email already exists',
            );
        }
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findById(id: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          inGameId: true,
          catPoints: true,
          xpsGained: true,
          currentLevel: true,
          username: true,
        },
      });
      return {
        ...user,
        rank: getCurrentRank(user.catPoints),
        xpsRequired: determineXPsRequired(user.currentLevel),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException('Cannot find user with the given id');
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findProfile(username: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { username },
        select: {
          id: true,
          username: true,
          joinedAt: true,
          catPoints: true,
          currentLevel: true,
          xpsGained: true,
        },
      });

      const {
        _max: { wpm: highestWpm },
        _count: { gameId: gamesPlayed },
      } = await this.prisma.gameHistory.aggregate({
        where: { playerId: user.id },
        _max: { wpm: true },
        _count: { gameId: true },
      });

      const {
        _avg: { wpm: lastTenAverageWpm },
      } = await this.prisma.gameHistory.aggregate({
        where: { playerId: user.id },
        _avg: { wpm: true },
        take: 10,
        orderBy: { game: { startedAt: 'desc' } },
      });

      return {
        ...user,
        rank: getCurrentRank(user.catPoints),
        highestWpm: highestWpm || 0,
        lastTenAverageWpm: lastTenAverageWpm || 0,
        gamesPlayed: gamesPlayed || 0,
        xpsRequired: determineXPsRequired(user.currentLevel),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === PrismaError.RecordNotFound)
          throw new NotFoundException(
            'Cannot find player with the given username',
          );
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
