import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':username/profile')
  getPlayerProfile(@Param('username') username: string) {
    return this.usersService.findProfile(username);
  }
}
