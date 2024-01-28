import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from './socket-state.adapter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({ cors: true })
export class SocketStateService {
  private socketState = new Map<number, AuthenticatedSocket[]>();
  @WebSocketServer() private server: Server;

  public async remove(userId: number): Promise<void> {
    const existingSockets = this.socketState.get(userId);

    if (!existingSockets) {
      return;
    }

    this.socketState.delete(userId);
  }

  public async add(userId: number, socket: AuthenticatedSocket): Promise<void> {
    const existingSockets = this.socketState.get(userId) || [];
    const sockets = [...existingSockets, socket];
    this.socketState.set(userId, sockets);
  }

  public get(userId: number): AuthenticatedSocket[] {
    return this.socketState.get(userId) || [];
  }

  public emitToUser(userId: number, event: string, payload: any): void {
    const userSockets = this.get(userId);
    if (userSockets) {
      userSockets.forEach((socket) => {
        socket.emit(event, payload);
      });
    }
  }

  public emitToRoom(roomName: string, event: string, payload: any): void {
    this.server.in(roomName).emit(event, payload);
  }

  public getAllRooms() {
    return Array.from(this.server.sockets.adapter.rooms);
  }
}
