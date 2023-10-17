import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MAX_CODE_LENGTH } from '../constants';
import { Languages } from '../enums/languages';

export class CodeSubmitDto {
  @IsString()
  @MaxLength(MAX_CODE_LENGTH)
  code: string;

  @IsEnum(Languages)
  language: Languages;

  @IsString()
  @IsOptional()
  version: string;
}
