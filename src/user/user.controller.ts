import { GetUser } from './../auth/decorators';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser('') user: User, @GetUser('email') email: string) {
    console.log({
      email,
    });
    return user;
  }
}
