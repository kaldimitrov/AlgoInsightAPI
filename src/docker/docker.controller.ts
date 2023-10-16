import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CodeSubmitDto } from './dto/code.dto';
import { NodeJsDockerService } from './services/nodejs-docker.service';
import { Languages } from './enums/languages';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Token } from 'src/auth/decorators/user.decorator';

@ApiTags('Code Endpoints')
@Controller('code')
export class DockerController {
  constructor(private readonly nodeJsService: NodeJsDockerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submit(@Token() token, @Body() body: CodeSubmitDto) {
    switch (body.language) {
      case Languages.NODE:
        return this.nodeJsService.execute(body.code);
    }
  }
}
