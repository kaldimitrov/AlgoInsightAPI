import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { GetHistoryDto } from './dto/history.dto';
import { Token } from 'src/auth/decorators/user.decorator';
import { TokenPayload } from 'src/auth/models/token.model';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Execution History Endpoints')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getHistory(@Token() token: TokenPayload, @Query() query: GetHistoryDto) {
    return this.historyService.filterHistory(token.userId, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getHistoryDetails(@Token() token: TokenPayload, @Param('id') id: string) {
    return this.historyService.getHistoryDetails(token.userId, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteHistory(@Token() token: TokenPayload, @Param('id') id: string) {
    return this.historyService.deleteHistory(token.userId, id);
  }
}
