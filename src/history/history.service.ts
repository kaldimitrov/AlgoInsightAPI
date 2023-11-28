import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { AuthService } from 'src/auth/auth.service';
import { TRANSLATIONS } from 'src/config/translations';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly userRepository: Repository<History>,
    private readonly authService: AuthService,
  ) {}
}
