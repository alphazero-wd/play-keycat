import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaError } from '../prisma/prisma-error';

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
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) return user;
    throw new BadRequestException({
      success: false,
      message: 'User with that email does not exist',
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return updatedUser;
  }

  async findById(id: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
        select: { id: true, inGameId: true, catPoints: true, username: true },
      });
      return user;
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
        highestWpm: highestWpm || 0,
        lastTenAverageWpm: lastTenAverageWpm || 0,
        gamesPlayed: gamesPlayed || 0,
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
