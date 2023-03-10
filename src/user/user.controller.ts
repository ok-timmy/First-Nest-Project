import { GetUser } from './../auth/decorators';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService){};

  @Get('me')
  getMe(@GetUser('') user: User, @GetUser('email') email: string) {
    console.log({
      email,
    });
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
