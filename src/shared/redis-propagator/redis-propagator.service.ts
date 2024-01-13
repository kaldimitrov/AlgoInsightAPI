import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Server } from 'socket.io';

import { RedisService } from '../redis/redis.service';
import { SocketStateService } from '../socket-state/socket-state.service';

import { RedisSocketEventRoomDto } from './dto/socket-event-room.dto';
import { RedisSocketEventUserDto } from './dto/socket-event-user.dto';
import { REDIS_SOCKET_EMIT_ROOM_EVENT, REDIS_SOCKET_EMIT_USER_EVENT } from './redis-propagator.constants';

@Injectable()
export class RedisPropagatorService {
  private socketServer: Server;

  public constructor(
    private readonly socketStateService: SocketStateService,
    private readonly redisService: RedisService,
  ) {
    this.redisService.fromEvent(REDIS_SOCKET_EMIT_USER_EVENT).pipe(tap(this.consumeUserEvent)).subscribe();
    this.redisService.fromEvent(REDIS_SOCKET_EMIT_ROOM_EVENT).pipe(tap(this.consumeRoomEvent)).subscribe();
  }

  public injectSocketServer(server: Server): RedisPropagatorService {
    this.socketServer = server;

    return this;
  }

  private consumeUserEvent = (eventInfo: RedisSocketEventUserDto): void => {
    const { userId, event, data } = eventInfo;

    return this.socketStateService.get(userId).forEach((socket) => {
      return socket.emit(event, data);
    });
  };

  private consumeRoomEvent = (eventInfo: RedisSocketEventRoomDto): void => {
    this.socketStateService.emitToRoom(eventInfo.room, eventInfo.event, eventInfo.data);
  };

  public emitToUser(eventInfo: RedisSocketEventUserDto): boolean {
    if (!eventInfo.userId) {
      return false;
    }

    this.redisService.publish(REDIS_SOCKET_EMIT_USER_EVENT, eventInfo);

    return true;
  }

  public emitToRoom(eventInfo: RedisSocketEventRoomDto): boolean {
    this.redisService.publish(REDIS_SOCKET_EMIT_ROOM_EVENT, eventInfo);

    return true;
  }
}
