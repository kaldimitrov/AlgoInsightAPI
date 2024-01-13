import { DockerService } from './docker.service';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class DockerGateway {
  constructor(private readonly dockerService: DockerService) {}

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
    return data;
  }
}
