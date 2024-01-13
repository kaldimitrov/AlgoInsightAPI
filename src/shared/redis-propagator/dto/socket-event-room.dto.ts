import { RedisSocketEventDto } from './socket-event.dto';

export class RedisSocketEventRoomDto extends RedisSocketEventDto {
  public readonly room: string;
}
