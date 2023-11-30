import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('Execution History Endpoints')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}
}
