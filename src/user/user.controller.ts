import { Controller, Post, UseGuards, Body, Put, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { TokenPayload } from 'src/auth/models/token.model';
import { Token } from 'src/auth/decorators/user.decorator';
import { User } from './user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User Endpoints')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.userService.login(dto);
  }

  @Post('refresh')
  refresh(@Body('refresh_token') refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    return this.userService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  updateUser(@Token() token: TokenPayload, @Body() dto: UpdateUserDto): Promise<User> {
    return this.userService.update(token.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@Token() token: TokenPayload): Promise<User> {
    return this.userService.findOne(token.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@Token() token: TokenPayload): Promise<void> {
    return this.userService.delete(token.userId);
  }
}
