import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async register(dto: CreateUserDto): Promise<string> {
    if (await this.findByEmail(dto.email)) {
      // TODO: Error creating user
    }

    const user: User = await this.userRepository.save({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      hashedPassword: await this.authService.hashPassword(dto.password),
    });

    if (!user) {
      // TODO: Error creating user
    }

    return this.authService.generateToken(user);
  }

  async login(dto: LoginUserDto): Promise<string> {
    const user: User = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      // TODO: Error for invalid user
    }

    if (!(await this.authService.comparePasswords(dto.password, user.hashedPassword))) {
      // TODO: Error for invalid password
    }

    return this.authService.generateToken(user);
  }

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findOne(userId);

    if (!existingUser) {
      // TODO: Error for invalid user
    }

    Object.assign(existingUser, updateUserDto);

    return this.userRepository.save(existingUser);
  }

  async delete(userId: number) {
    await this.userRepository.delete({ id: userId });
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
