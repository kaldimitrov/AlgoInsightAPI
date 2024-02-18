import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { CreateHistoryDto, GetHistoryDto } from './dto/history.dto';
import { historyQueryConfig } from './config/round-query.config';
import QueryHelper from 'src/helpers/QueryHelper';
import { ExecutionStatus } from './enums/executionStatus';
import { OrderTypes } from './enums/orderOptions';

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

  deleteHistory(user_id: number, id: string) {
    return this.historyRepository.delete({ id, user_id });
  }

  getHistoryDetails(userId: number, id: string) {
    return this.historyRepository.findOneBy({ user_id: userId, id });
  }

  async filterHistory(userId: number, dto: GetHistoryDto) {
    const historyQuery = this.historyRepository
      .createQueryBuilder('r')
      .orderBy(`r.${dto.orderOptions}`, dto.orderBy, dto.orderBy == OrderTypes.ASC ? 'NULLS FIRST' : 'NULLS LAST')
      .select([
        'r.id',
        'r.name',
        'r.execution_time',
        'r.status',
        'r.language',
        'r.max_memory',
        'r.max_cpu',
        'r.created_at',
      ]);

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

  async generateUserReport(userId: number): Promise<any> {
    const executions = await this.historyRepository
      .createQueryBuilder('history')
      .select([
        'history.created_at',
        'history.status',
        'history.execution_time',
        'history.max_cpu',
        'history.max_memory',
      ])
      .where('history.user_id = :userId', { userId })
      .getMany();

    let totalExecutionTime = 0;
    let totalMaxCpu = 0;
    let totalMaxMemory = 0;

    const chartData = {
      days: [],
      executionTime: [],
      maxCpu: [],
      maxMemory: [],
    };

    executions.forEach((execution) => {
      totalExecutionTime += execution.execution_time || 0;
      totalMaxCpu += execution.max_cpu || 0;
      totalMaxMemory += execution.max_memory || 0;

      const day = execution.created_at.toISOString().split('T')[0];
      if (!chartData.days.includes(day)) {
        chartData.days.push(day);
        chartData.executionTime.push(0);
        chartData.maxCpu.push(0);
        chartData.maxMemory.push(0);
      }

      const index = chartData.days.indexOf(day);
      chartData.executionTime[index] += execution.execution_time || 0;
      chartData.maxCpu[index] = Math.max(chartData.maxCpu[index], execution.max_cpu || 0);
      chartData.maxMemory[index] = Math.max(chartData.maxMemory[index], execution.max_memory || 0);
    });

    const response = {
      totalExecutionTime,
      totalMaxCpu: totalMaxCpu.toFixed(2),
      totalMaxMemory: totalMaxMemory.toFixed(2),
      chartData,
    };

    const sortedDayIndices = chartData.days
      .map((day, index) => ({ day, index }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((item) => item.index);

    response.chartData.days = sortedDayIndices.map((index) => chartData.days[index]);
    response.chartData.executionTime = sortedDayIndices.map((index) => chartData.executionTime[index]);
    response.chartData.maxCpu = sortedDayIndices.map((index) => chartData.maxCpu[index]);
    response.chartData.maxMemory = sortedDayIndices.map((index) => chartData.maxMemory[index]);

    return response;
  }
}
