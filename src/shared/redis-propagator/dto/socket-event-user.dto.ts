import { RedisSocketEventDto } from './socket-event.dto';

export class RedisSocketEventUserDto extends RedisSocketEventDto {
  public readonly userId: number;
}
