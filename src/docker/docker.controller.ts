import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CodeSubmitDto } from './dto/code.dto';
import { DockerService } from './docker.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Token } from 'src/auth/decorators/user.decorator';
import { containers } from 'src/config/containers';
import { TokenPayload } from 'src/auth/models/token.model';

@ApiTags('Code Endpoints')
@Controller('code')
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submit(@Token() token: TokenPayload, @Body() body: CodeSubmitDto) {
    return this.dockerService.execute(
      body.files,
      { ...containers[body.language], version: body.version ?? 'latest' },
      token.userId,
      body.language,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('state')
  getExecutionState(@Token() token: TokenPayload) {
    return this.dockerService.getExecutionStatus(token.userId);
  }

  @Get('languages')
  getLanguages() {
    return {
      languages: Object.keys(containers).map((key) => {
        return {
          name: containers[key].name,
          fileName: containers[key].fileName,
        };
      }),
    };
  }
}
