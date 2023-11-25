import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CodeSubmitDto } from './dto/code.dto';
import { DockerService } from './docker.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Token } from 'src/auth/decorators/user.decorator';
import { containers } from 'src/config/containers';

@ApiTags('Code Endpoints')
@Controller('code')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submit(@Token() token, @Body() body: CodeSubmitDto) {
    return this.dockerService.execute(
      body.code,
      { ...containers[body.language], version: body.version ?? 'latest' },
      token.userId,
    );
  }
}
