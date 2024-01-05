import { Component, OnInit } from '@angular/core';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  
  title = 'board_game_alpha_test_frontend';

  ngOnInit(): void {
    SocketService.connect("ws://127.0.0.1:8080")
    // SocketService.messages$.subscribe(
    //   message => {
    //     console.log("MESSAGE IN COMPONENT: ", message);
    //   },
    //   error => console.error('Error receiving WebSocket messages', error),
    //   () => console.log('WebSocket connection closed')
    // );
  }



}
