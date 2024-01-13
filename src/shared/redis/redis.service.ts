import { Inject, Injectable } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { RedisSocketEventDto } from '../redis-propagator/dto/socket-event.dto';

import { REDIS, REDIS_BULL } from './redis.constants';
import { RedisClient } from './redis.providers';

export interface RedisSubscribeMessage {
  readonly message: string;
  readonly channel: string;
}

@Injectable()
export class RedisService {
  public constructor(
    @Inject(REDIS)
    private readonly redis: RedisClient,
    @Inject(REDIS_BULL)
    private readonly redisBull: RedisClient,
  ) {}

  public fromEvent<T extends RedisSocketEventDto>(eventName: string): Observable<T> {
    this.redisBull.subscribe(eventName);

    return Observable.create((observer: Observer<RedisSubscribeMessage>) =>
      this.redisBull.on('message', (channel, message) => observer.next({ channel, message })),
    ).pipe(
      filter(({ channel }) => channel === eventName),
      map(({ message }) => JSON.parse(message)),
    );
  }

  public async publish(channel: string, value: unknown): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      return this.redis.publish(channel, JSON.stringify(value), (error, reply) => {
        if (error) {
          return reject(error);
        }

        return resolve(reply);
      });
    });
  }
}
