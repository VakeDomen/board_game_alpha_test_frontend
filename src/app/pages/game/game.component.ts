import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Tile } from 'src/app/components/canvas/canvas.component';
import { DisplayState, GameWrapper } from 'src/app/models/game-wrapper.model';
import { Game, GameState } from 'src/app/models/game.model';
import { TileRecipes } from 'src/app/models/recepie.model';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { MessageResponse, SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {


  public isReady = false;
  public labelPlayerTurn: string = "";
  public phase: string = "";
  public playerTurn: string = "";
  public myTurn: boolean = true;

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
    const error = JSON.parse(response.data)["Error"];
    if (error) {
      console.log("Error: ", error);
      SocketService.sendMessage("undo", "GAME " + this.name + " Undo");
    }


    if (response.message[0] == "state") {
      this.stateParser(response.data);
    }

    if (response.message[0] == "nextPhase") {
      this.stateParser(response.data);
    }

    if (response.message[0] == "applyPhase") {
      if (response.data) {
        console.log(response);
      }
      this.stateParser(response.data)
    }

    if (response.message[0] == "recepies") {
      this.recepiesParser(response.data);
    }

    if (response.message[0] == "baseSetup") {
      SocketService.sendMessage("applyPhase", "GAME " + this.name + " ApplyPhase")
    }

    if (response.message[0] == "undo") {
      SocketService.sendMessage("applyPhase", "GAME " + this.name + " ApplyPhase")
    }

    if (response.message[0] == "tilePlacement") {
      SocketService.sendMessage("applyPhase", "GAME " + this.name + " ApplyPhase")
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

    if (AuthService.getName() == this.game.player1) {
      GameService.reverseGameMapRows(this.game);
    }
    if (!this.wrapper) {
      this.wrapper = GameService.createDefaultWrapper(this.game, this.recepies)
    } 

    this.wrapper = GameService.updateWrapperGame(this.wrapper, this.game);
    this.phase = GameService.getPhase(this.wrapper);
    this.playerTurn = GameService.getPlayerTurn(this.wrapper);
    this.labelPlayerTurn = this.getPlayerTurnLabel();
    this.myTurn = GameService.isMyTurn(this.wrapper);
    
    // revert possible already done moves on phase load
    // just to avoid wierd states
    const lastState = GameService.getLastState(this.wrapper);
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

  getPlayerTurnLabel(): string {
    if (!this.wrapper) {
      return "Unknown";
    }
    return GameService.getCurrentPlayerTurnSide(this.wrapper) + 
      " - " + 
      GameService.getCurrentPlayerTurnName(this.wrapper);
  }

  updateWrapper(newWrapper: GameWrapper) {
    this.wrapper = {...newWrapper};
  }

  handleTileClick(tile: Tile) {
    const lastState = GameService.tryToGetLastState(this.wrapper);;
    if (!lastState) {
      return
    }  
    if (lastState.turn_phase == 'Setup') {
      this.handleTileClickSetupPhase(tile);
    }

    if (lastState.turn_phase == 'Main') {
      this.handleTileClickMainPhase(tile);
    }
  }
  handleTileClickMainPhase(tile: Tile) {
    const lastState = GameService.tryToGetLastState(this.wrapper);;
    if (!this.wrapper || !GameService.isMyTurn(this.wrapper) ||  !lastState) {
      return
    }
    if (AuthService.getName() == this.wrapper.game.player1) {
      tile.x = lastState.map.length - 1 - tile.x;
    }

    // placed a tile
    if (this.wrapper.canvasState.display.includes("footprint")) {
      const tileSelector = this.wrapper.canvasState.tileSelector;
      SocketService.sendMessage("tilePlacement", "GAME " + 
        this.name + 
        " PlaceTile " + 
        tileSelector + 
        " " +
        tile.x + 
        " " + 
        tile.y +
        " 0")
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
    const lastState = GameService.tryToGetLastState(this.wrapper);;
    if (!this.wrapper || !GameService.isMyTurn(this.wrapper) ||  !lastState) {
      return
    }
    if (AuthService.getName() == this.wrapper.game.player1) {
      tile.x = lastState.map.length - 1 - tile.x;
    }

    if (lastState.move_que.length == 0) {
      SocketService.sendMessage("baseSetup", "GAME " + this.name + " BaseSetup " + tile.x + " " + tile.y)
    }

  }


}
