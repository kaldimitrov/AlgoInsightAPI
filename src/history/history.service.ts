import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    private readonly authService: AuthService,
  ) {}

  saveHistory(dto: Partial<History>) {
    return this.historyRepository.save(dto);
  }
}
