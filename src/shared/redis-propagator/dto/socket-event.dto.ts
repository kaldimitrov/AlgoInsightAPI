export class RedisSocketEventDto {
  public readonly event: string;
  public readonly data?: unknown = {};
  public readonly socketId?: string;
}
