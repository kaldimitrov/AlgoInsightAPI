import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { AuthService } from 'src/auth/auth.service';
import { CreateHistoryDto } from './dto/history.dto';
import { ExecutionStatus } from './enums/executionStatus';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  getHistoryById(id: string) {
    return this.historyRepository.findOneBy({ id });
  }

  createHistory(dto: CreateHistoryDto) {
    return this.historyRepository.save(dto);
  }

  async updateHistoryProperties(historyId: string, propertiesToUpdate: Partial<History>) {
    const history = await this.getHistoryById(historyId);

    Object.assign(history, propertiesToUpdate);

    return this.historyRepository.save(history);
  }
}
