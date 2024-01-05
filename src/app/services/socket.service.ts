import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type MessageResponse = {
  message: [string, string],
  data: string,
}
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private static socket: WebSocket | undefined;
  private static messagesSubject = new Subject<MessageResponse>(); // Subject to emit received messages
  public static messages$ = SocketService.messagesSubject.asObservable();
  private static waitingMessage: [string, string] | undefined = undefined;

  private static messageQue: [string, string][] = [];

  constructor() { }

  public static connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = event => {
      console.log('Connection opened:', event);
    };

    this.socket.onmessage = event => {
      if (SocketService.waitingMessage) {
        console.log("Recieved: " + SocketService.waitingMessage[0]);
        this.messagesSubject.next({
          message: SocketService.waitingMessage,
          data: event.data
        }); // Emit the received message
        if (SocketService.messageQue.length) {
          SocketService.waitingMessage = SocketService.messageQue.pop();
          if (SocketService.waitingMessage) {
            const message = SocketService.waitingMessage[1];
            console.log("Sending: " + SocketService.waitingMessage[0]);
            this.socket?.send(message);
          }
        } else {
          SocketService.waitingMessage = undefined;
        }
      } else {
        console.log("Socket que is broken");
      }
    };

    this.socket.onclose = event => {
      console.log('Connection closed:', event);
    };

    this.socket.onerror = event => {
      console.error('WebSocket error:', event);
    };
  }

  public static sendMessage(id: string, message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.messageQue.push([id, message]);

      if (!SocketService.waitingMessage) {
        SocketService.waitingMessage = SocketService.messageQue.pop();
        console.log("Sending: ", SocketService.waitingMessage ? SocketService.waitingMessage[0] : "");
        this.socket.send(message);
      }

    } else {
      console.error('WebSocket is not connected.');
    }
  }

  public static getState(): number | undefined {
    return this.socket?.readyState;
  }

  public static close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
