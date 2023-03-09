import { ConfigService } from '@nestjs/config';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
// import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    const { password, email } = dto;
    // Generate the password hash
    const hash = await argon.hash(password);

    //save the new user in a db
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      //return the saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      //   console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async signin(dto: AuthDto) {
    const { email, password } = dto;
    //Find User email and password
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    //If user does not exist, throw exception
    if (!user) throw new ForbiddenException('Email does not exist');

    //compare password
    const pwMatches = await argon.verify(user.hash, password);
    //If password is incorrect, throw exception
    if (!pwMatches) throw new ForbiddenException('Password is incorrect');

    //Send back the user
    delete user.hash;

    return this.signToken(user.id, user.email);
    // return { msg: 'I am sign in' };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
