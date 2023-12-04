import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Languages } from 'src/docker/enums/languages';

export interface CreateHistoryDto {
  language: Languages;
  user_id: number;
}
