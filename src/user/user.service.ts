import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { TRANSLATIONS } from 'src/config/translations';
import { validatePassword } from 'src/helpers/RegexHelper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async register(dto: CreateUserDto): Promise<{ access_token: string; refresh_token: string }> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException(TRANSLATIONS.errors.user.email_taken);
    }

    if (!validatePassword(dto.password)) {
      throw new BadRequestException(TRANSLATIONS.errors.user.invalid_password);
    }

    const user: User = await this.userRepository.save({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      hashedPassword: await this.authService.hashPassword(dto.password),
    });

    if (!user) {
      throw new BadRequestException(TRANSLATIONS.errors.user.invalid_user);
    }

    return {
      access_token: await this.authService.generateToken(user),
      refresh_token: this.authService.signRefreshToken(user.id),
    };
  }

  async login(dto: LoginUserDto): Promise<{ access_token: string; refresh_token: string }> {
    const user: User = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException(TRANSLATIONS.errors.user.invalid_credentials);
    }

    if (!(await this.authService.comparePasswords(dto.password, user.hashedPassword))) {
      throw new UnauthorizedException(TRANSLATIONS.errors.user.invalid_credentials);
    }

    return {
      access_token: await this.authService.generateToken(user),
      refresh_token: this.authService.signRefreshToken(user.id),
    };
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findOne(userId);

    if (!existingUser) {
      throw new BadRequestException(TRANSLATIONS.errors.user.invalid_user);
    }

    Object.assign(existingUser, updateUserDto);

    const user = await this.userRepository.save(existingUser);

    delete user.hashedPassword;
    return user;
  }

  async delete(userId: number) {
    await this.userRepository.delete({ id: userId });
  }

  async findOne(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(TRANSLATIONS.errors.user.invalid_user);
    }

    delete user.hashedPassword;
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    let decodedToken: { aud: string };
    try {
      decodedToken = await this.authService.verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new UnauthorizedException(TRANSLATIONS.errors.user.invalid_user);
    }
    const user = await this.userRepository.findOneBy({ id: Number(decodedToken.aud) });
    if (!user) {
      throw new UnauthorizedException(TRANSLATIONS.errors.user.invalid_user);
    }

    return {
      access_token: await this.authService.generateToken(user),
      refresh_token: this.authService.signRefreshToken(user.id),
    };
  }
}
