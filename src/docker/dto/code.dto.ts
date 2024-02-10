import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Languages } from '../enums/languages';
import { Type } from 'class-transformer';

export class FileDto {
  @IsString()
  path: string;

  @IsString()
  content: string;
}

export class CodeSubmitDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  files: FileDto[];

  @IsEnum(Languages)
  language: Languages;

  @IsString()
  @IsOptional()
  version: string;
}
