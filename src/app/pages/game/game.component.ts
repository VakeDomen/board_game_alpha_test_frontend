import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Tile } from 'src/app/components/canvas/canvas.component';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { Game, GameState } from 'src/app/models/game.model';
import { TileRecipes } from 'src/app/models/recepie.model';
import { AuthService } from 'src/app/services/auth.service';
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
  public game: Game | undefined;
  public recepies: TileRecipes | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    SocketService.messages$.subscribe(this.messageParser)
    this.route.paramMap.subscribe((params: ParamMap) => {
      let name = params.get('name');
      if (!name) {
        this.router.navigate(["lobby"]);
      } else {
        this.name = name;
      }
      SocketService.sendMessage("state", "GAME " + name + " GetState");
      SocketService.sendMessage("recepies", "GAME " + name + " GetRecepies");
    });
  }

  ngOnInit(): void {

  }

  private messageParser = (response: MessageResponse) => {
    if (response.message[0] == "state") {
      this.stateParser(response.data);
    }

    if (response.message[0] == "recepies") {
      this.recepiesParser(response.data);
    }

    if (response.message[0] == "baseSetup") {
      SocketService.sendMessage("applyPhase", "GAME " + this.name + " ApplyPhase")
    }

    if (response.message[0] == "applyPhase") {
      this.stateParser(response.data)
    }

    if (response.message[0] == "undo") {
      this.stateParser(response.data)
    }
  }

  recepiesParser(data: string) {
    this.recepies = JSON.parse(data)["TileRecepeies"] as TileRecipes;
    this.createWrapper();
  }

  stateParser(data: string) {
    this.game = JSON.parse(data)["State"] as Game;
    this.createWrapper();
  }

  createWrapper() {
    if (!this.game) {
      return
    }
    if (!this.recepies) {
      return
    }
    this.wrapper = {
      game: this.game,
      recepies: this.recepies,
    } as unknown as GameWrapper;

    const lastState = this.getLastState()
    // revert possible already done moves on phase load
    // just to avoid wierd states
    if (!this.isReady && lastState && lastState.move_que.length > 0) {
      SocketService.sendMessage("undo", "GAME " + this.name + " Undo");
    } else {
      this.isReady = true;
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

  updateWrapper(newWrapper: GameWrapper) {
    this.wrapper = {...newWrapper};
  }

  handleTileClick(tile: Tile) {
    const lastState = this.getLastState();
    if (!lastState) {
      return
    }  
    if (lastState.turn_phase == 'Setup') {
      this.handleTileClickSetupPhase(tile);
    }
  }
  
  myTurn(): boolean {
    const lastState = this.getLastState();
    if (!this.wrapper || !lastState) {
      return false;
    } 

    if (lastState.player_turn == 'First') {
      return this.wrapper.game.player1 == AuthService.getName();
    } else {
      return this.wrapper.game.player2 == AuthService.getName();
    }
  }

  undo() {
    SocketService.sendMessage("undo", "GAME " + this.name + " Undo");
  }

  nextPhase() {
    SocketService.sendMessage("nextPhase", "GAME " + this.name + " NextPhase");
  }

  // SETUP PHASE STUFF
  handleTileClickSetupPhase(tile: Tile) {
    if (!this.myTurn()) {
      return
    }
    SocketService.sendMessage("baseSetup", "GAME " + this.name + " BaseSetup " + tile.x + " " + tile.y)
  }


}
