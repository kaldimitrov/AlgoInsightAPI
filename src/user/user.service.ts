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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async register(dto: CreateUserDto): Promise<{ token: string }> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException({ error: TRANSLATIONS.errors.user.email_taken });
    }

    const user: User = await this.userRepository.save({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      hashedPassword: await this.authService.hashPassword(dto.password),
    });

    if (!user) {
      throw new BadRequestException({ error: TRANSLATIONS.errors.user.invalid_user });
    }

    return { token: await this.authService.generateToken(user) };
  }

  async login(dto: LoginUserDto): Promise<{ token: string }> {
    const user: User = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException({ error: TRANSLATIONS.errors.user.invalid_credentials });
    }

    if (!(await this.authService.comparePasswords(dto.password, user.hashedPassword))) {
      throw new UnauthorizedException({ error: TRANSLATIONS.errors.user.invalid_credentials });
    }

    return { token: await this.authService.generateToken(user) };
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findOne(userId);

    if (!existingUser) {
      throw new BadRequestException({ error: TRANSLATIONS.errors.user.invalid_user });
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
      throw new NotFoundException({ error: TRANSLATIONS.errors.user.invalid_user });
    }

    delete user.hashedPassword;
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
