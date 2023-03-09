import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authSevice: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto): object {
    console.log({
      dto,
    });
    return this.authSevice.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto): object {
    return this.authSevice.signin(dto);
  }
}
