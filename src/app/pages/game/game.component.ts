import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { Game, GameState } from 'src/app/models/game.model';
import { MessageResponse, SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  public isReady = false;

  public name: string | undefined;
  public wrapper: GameWrapper | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    SocketService.messages$.subscribe(this.messageParser)
    this.route.paramMap.subscribe((params: ParamMap) => {
      let name = params.get('name');
      if (!name) {
        this.router.navigate(["lobby"]);
      }
      SocketService.sendMessage("state", "GAME " + name + " GetState");
    });
  }

  ngOnInit(): void {

  }

  private messageParser = (response: MessageResponse) => {
    if (response.message[0] == "state") {
      this.stateParser(response.data);
    }
  }

  stateParser(data: string) {
    if (!this.wrapper) {
      console.log((JSON.parse(data)["State"] as Game))
      this.wrapper = {
        game: (JSON.parse(data)["State"] as Game),
      } as unknown as GameWrapper;
      this.isReady = true;
    } else {
      this.wrapper.game = JSON.parse(data)["State"] as Game;
    }
  }

  getGameName(): string {
    if (!this.wrapper) {
      return "Unknown game";
    }
    return this.wrapper.game.name;
  }

  getPlayerName(pl: string) {
    if (!this.wrapper) {
      return "Unknown";
    }

    if (pl == "First") {
      return this.wrapper.game.player1;
    }
    if (pl == "Second") {
      return this.wrapper.game.player2;
    }
    console.log("Unknown player selector: ", pl);
    return "Unknown";
  }

  getPhase() {
    if (!this.wrapper) {
      return "End";
    }
    console.log("Phase", this.wrapper.game.states[this.wrapper.game.states.length - 1].turn_phase);
    return this.wrapper.game.states[this.wrapper.game.states.length - 1].turn_phase;
  }

  getPlayerTurnLabel() {
    const state = this.getLastState();
    if (!state) {
      return "Unknown player turn";
    }

    if (state.player_turn == 'First') {
      return "Tech - " + this.getPlayerName(state.player_turn)
    }

    if (state.player_turn == 'Second') {
      return "Bug - " + this.getPlayerName(state.player_turn)
    }
    return "Unknown"
  }

  getLastState(): GameState | undefined {
    return this.wrapper?.game.states[this.wrapper.game.states.length - 1]
  }

}
