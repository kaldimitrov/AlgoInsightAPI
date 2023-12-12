import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, isPositive } from 'class-validator';
import { Languages } from 'src/docker/enums/languages';
import { MAX_PAGE_SIZE } from '../constants';

export class GetHistoryDto {
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

  @IsInt()
  @Min(0, { message: 'Value must be a positive integer' })
  page: number;

  @IsInt()
  @Max(MAX_PAGE_SIZE)
  @Min(0, { message: 'Value must be a positive integer' })
  pageSize: number;
}

export interface CreateHistoryDto {
  language: Languages;
  user_id: number;
}
