import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { AuthService } from 'src/app/services/auth.service';
import { MessageResponse, SocketService } from 'src/app/services/socket.service';

interface OpenGame {
  name: string,
  player1: string,
  player2: string | null,
}
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.sass']
})
export class LobbyComponent implements OnInit {  
  public newGameName: string;
  public openGames: OpenGame[] = [];
  public runningGames: Game[] = [];
  public closedGames: Game[] = [];

  constructor(
    private router: Router,
  ) { 
    this.newGameName = `Game-${Math.round(Math.random() * 1000)}`;
    SocketService.messages$.subscribe(this.messageParser)
  }

  ngOnInit(): void {
    SocketService.sendMessage("lobby", "CONTROL LOBBY " + AuthService.name);
    SocketService.sendMessage("running", "CONTROL RUNNING " + AuthService.name);
  }


  private messageParser = (response: MessageResponse) => {
    if (response.message[0] == "lobby") {
      this.parseLobbyMessage(response.data);
    }

    if (response.message[0] == "running") {
      this.parseRunningMessage(response.data);
    }

    if (response.message[0] == "newGame") {
      this.parseNewGame(response.data);
    }
    
    if (response.message[0] == "joinGame") {
      this.parseJoinGame(response.data);
    }
    
    if (response.message[0] == "startGame") {
      this.parseStartGame(response.data);
    }
  }


  parseStartGame(data: string) {
    SocketService.sendMessage("running", "CONTROL RUNNING " + AuthService.name);
  }

  parseJoinGame(data: string) {
    SocketService.sendMessage("lobby", "CONTROL LOBBY " + AuthService.name);
  }

  parseNewGame(data: string) {
    SocketService.sendMessage("lobby", "CONTROL LOBBY " + AuthService.name);
  }

  parseLobbyMessage(data: string) {
    this.openGames = JSON.parse(data)["Lobby"] ?? [];
  }
  parseRunningMessage(data: string) {
    const games: Game[] = JSON.parse(data)["Running"];
    if (games && games.length) {
      for (const game of games) {
        if (!!game.states[game.states.length - 1].winner) {
          this.closedGames.push(game);
        } else {
          this.runningGames.push(game);
        }
      }
    }
  }

  canJoin(game: OpenGame): boolean {
    if (game.player2) {
      return false;
    }

    if (this.isHost(game)) {
      return false;
    }

    return true;
  }

  isHost(game: OpenGame): boolean {
    if (this.myName() == game.player1) {
      return true;
    }

    return false;
  }

  joinGame(game: OpenGame) {
    SocketService.sendMessage("joinGame", "CONTROL JOIN " + game.name);
  }

  startGame(game: OpenGame) {
    SocketService.sendMessage("startGame", "CONTROL START " + game.name);
  }


  createGame() {
    if (this.newGameName.includes(" ")) {
      this.newGameName.replace(" ", "-");
    }
    SocketService.sendMessage("newGame", "CONTROL CREATE " + this.newGameName);
  }

  openGame(game: Game) {
    this.router.navigate(["game", game.name]);
  }

  myName() {
    return AuthService.getName();
  }

}
