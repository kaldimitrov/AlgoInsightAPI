import { Controller, Post, UseGuards, Body, Put, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/models/token.model';
import { Token } from 'src/auth/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('Execution History Endpoints')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}
}
