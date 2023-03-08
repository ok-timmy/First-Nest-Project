import { Body, Controller, Post } from '@nestjs/common';
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
    return this.authSevice.signup();
  }

  @Post('signin')
  signin(): object {
    return this.authSevice.signin();
  }
}
