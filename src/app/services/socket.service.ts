import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private static socket: WebSocket | undefined;
  private static messagesSubject = new Subject<string>(); // Subject to emit received messages
  public static messages$ = SocketService.messagesSubject.asObservable();

  constructor() { }

  public static connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = event => {
      console.log('Connection opened:', event);
      
    };

    this.socket.onmessage = event => {
      console.log('Message from server:', event.data);
      this.messagesSubject.next(event.data); // Emit the received message
    };

    this.socket.onclose = event => {
      console.log('Connection closed:', event);
    };

    this.socket.onerror = event => {
      console.error('WebSocket error:', event);
    };
  }

  public static sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
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
