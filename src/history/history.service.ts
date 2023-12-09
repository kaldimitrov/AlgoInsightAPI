import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { CreateHistoryDto } from './dto/history.dto';

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
    return this.historyRepository.save(new History(dto));
  }

  async updateHistory(history: Partial<History>) {
    return this.historyRepository.save(history);
  }
}
