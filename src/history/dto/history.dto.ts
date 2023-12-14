import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Languages } from 'src/docker/enums/languages';
import { MAX_PAGE_SIZE } from '../constants';
import { ExecutionStatus } from '../enums/executionStatus';
import { OrderOptions, OrderTypes } from '../enums/orderOptions';

export class GetHistoryDto {
  @IsEnum(Languages)
  @IsOptional()
  language?: Languages;

  @IsEnum(ExecutionStatus)
  @IsOptional()
  status?: ExecutionStatus;

  @IsNumber()
  @IsOptional()
  min_cpu_usage?: number;

  @IsNumber()
  @IsOptional()
  max_cpu_usage?: number;

  @IsNumber()
  @IsOptional()
  min_memory_usage?: number;

  @IsNumber()
  @IsOptional()
  max_memory_usage?: number;

  @IsNumber()
  @IsOptional()
  min_execution_time?: number;

  @IsNumber()
  @IsOptional()
  max_execution_time?: number;

  @IsString()
  @IsOptional()
  date_start?: string;

  @IsString()
  @IsOptional()
  date_end?: string;

  @IsEnum(OrderTypes)
  orderBy: OrderTypes = OrderTypes.DESC;

  @IsEnum(OrderOptions)
  orderOptions: OrderOptions = OrderOptions.CREATED_AT;

  @IsInt()
  @Min(1, { message: 'page must be greater than 1' })
  page: number = 1;

  @IsInt()
  @Max(MAX_PAGE_SIZE)
  @Min(1, { message: 'pageSize must be greater than 1' })
  pageSize: number = 20;
}

export interface CreateHistoryDto {
  language: Languages;
  user_id: number;
}
