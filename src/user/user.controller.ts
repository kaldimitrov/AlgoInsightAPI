import { Controller, Post, UseGuards, Body, Put, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { TokenPayload } from 'src/auth/models/token.model';
import { Token } from 'src/auth/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.userService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  updateUser(@Token() token: TokenPayload, @Body() dto: UpdateUserDto) {
    return this.userService.update(token.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@Token() token: TokenPayload) {
    return this.userService.findOne(token.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@Token() token: TokenPayload) {
    return this.userService.delete(token.userId);
  }
}
