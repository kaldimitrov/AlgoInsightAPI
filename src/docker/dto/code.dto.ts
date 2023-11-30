import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Languages } from '../enums/languages';

export class CodeSubmitDto {
  @IsString()
  code: string;

  @IsEnum(Languages)
  language: Languages;

  @IsString()
  @IsOptional()
  version: string;
}
