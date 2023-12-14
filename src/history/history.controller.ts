import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { GetHistoryDto } from './dto/history.dto';
import { Token } from 'src/auth/decorators/user.decorator';
import { TokenPayload } from 'src/auth/models/token.model';

@ApiTags('Execution History Endpoints')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistory(@Token() token: TokenPayload, @Query() query: GetHistoryDto) {
    
  }
}
