import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import socketio from 'socket.io';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';
import { SocketStateService } from './socket-state.service';
import { AuthService } from '../../auth/auth.service';

interface TokenPayload {
  readonly userId: number;
  readonly firstName: string;
  readonly lastName: string;
}

export interface AuthenticatedSocket extends socketio.Socket {
  auth: TokenPayload;
}

export class SocketStateAdapter extends IoAdapter {
  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
    private authService: AuthService,
  ) {
    super(app);
  }

  public createIOServer(port: number, options) {
    const server = super.createIOServer(port, options);
    this.redisPropagatorService.injectSocketServer(server);

    server.use(async (socket: AuthenticatedSocket, next) => {
      if (!socket.handshake?.headers?.authorization) {
        socket.auth = null;

        return socket.disconnect();
      }

      try {
        const decoded = this.authService.decodeToken(socket.handshake.headers.authorization.split(' ')[1]);

        if (!decoded) {
          return socket.disconnect();
        }

        decoded.exp = decoded.exp * 1000;

        if (Date.now() > decoded.exp) {
          return socket.disconnect();
        }

        socket.data.user = decoded;

        socket.auth = {
          userId: decoded.userId,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        };

        return next();
      } catch (e) {
        return next(e);
      }
    });

    return server;
  }

  public bindClientConnect(server: socketio.Server, callback): void {
    server.on('connection', async (socket: AuthenticatedSocket) => {
      if (socket.auth) {
        await this.socketStateService.add(socket.auth.userId, socket);

        socket.on('disconnect', async () => {
          await this.socketStateService.remove(socket.auth.userId);

          socket.removeAllListeners('disconnect');
        });
      }

      callback(socket);
    });
  }
}
