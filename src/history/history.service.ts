import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { CreateHistoryDto, GetHistoryDto } from './dto/history.dto';
import { historyQueryConfig } from './config/round-query.config';
import QueryHelper from 'src/helpers/QueryHelper';
import { ExecutionStatus } from './enums/executionStatus';

@Injectable()
export class HistoryService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}
  async onApplicationBootstrap() {
    await this.historyRepository.update({ status: ExecutionStatus.PENDING }, { status: ExecutionStatus.TIMEOUT });
  }

  getHistoryById(id: string) {
    return this.historyRepository.findOneBy({ id });
  }

  createHistory(dto: CreateHistoryDto) {
    return this.historyRepository.save(new History(dto));
  }

  updateHistory(history: Partial<History>) {
    return this.historyRepository.save(history);
  }

  getHistoryDetails(userId: number, id: string) {
    return this.historyRepository.findOneBy({ user_id: userId, id });
  }

  async filterHistory(userId: number, dto: GetHistoryDto) {
    const historyQuery = this.historyRepository.createQueryBuilder('r').orderBy(`r.${dto.orderOptions}`, dto.orderBy);

    QueryHelper.applyFilters(historyQuery, historyQueryConfig, { userId, ...dto });
    const [result, total] = await Promise.all([
      QueryHelper.paginateAndGetMany(historyQuery, dto.page, dto.pageSize),
      historyQuery.getCount(),
    ]);

    return {
      data: result,
      pageSize: dto.pageSize,
      pages: Math.ceil(total / dto.pageSize),
      total,
    };
  }
}
