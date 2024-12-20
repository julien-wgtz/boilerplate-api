import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Ajuste le domaine de ton frontend
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Stockage des connexions des utilisateurs par ID
  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.clients.delete(userId);
    }
  }

  @SubscribeMessage('sendNotification')
  sendNotificationToClient(client: Socket, payload: any): void {
    client.emit('newNotification', payload);
  }

  sendNotificationToUser(userId: string, notification: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('newNotification', notification);
    }
  }
  // Méthode pour envoyer une notification à tous les clients
  broadcastNotification(notification: any) {
    this.server.emit('newNotification', notification);
  }
}
