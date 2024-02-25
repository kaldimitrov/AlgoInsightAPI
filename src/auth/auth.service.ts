import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import RandomKey from '../helpers/RandomKey';
import { User } from 'src/user/user.entity';
import { DecodedToken, TokenPayload } from './models/token.model';
import { ConfigService } from '@nestjs/config';
/* eslint-disable */
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
  }

  comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async generateToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
      payload: RandomKey.generate(256),
    };

    return this.jwtService.sign(payload);
  }

  signRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { payload: RandomKey.generate(256) },
      {
        expiresIn: this.configService.get('jwt.refresh_expiration'),
        secret: this.configService.get('jwt.refresh_secret'),
        audience: userId.toString(),
        subject: 'refresh',
      },
    );
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get('jwt.refresh_secret'),
      subject: 'refresh',
    });
  }

  decodeToken(token: string): DecodedToken {
    return this.jwtService.decode(token) as DecodedToken;
  }
}
