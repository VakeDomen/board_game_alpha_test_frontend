import { Injectable } from '@angular/core';
import { DisplayState, GameWrapper } from '../models/game-wrapper.model';
import { AuthService } from './auth.service';
import { Game, GameState } from '../models/game.model';
import { TileRecipes } from '../models/recepie.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }

  static isMyTurn(wrapper: GameWrapper): boolean {
    const name = AuthService.getName();
    const lastState = GameService.getLastState(wrapper);
    if (lastState.player_turn == 'First') {
      return wrapper.game.player1 == name;
    } else {
      return wrapper.game.player2 == name;
    }
  }

  static getCurrentPlayerTurnName(wrapper: GameWrapper): String {
    const state = this.getLastState(wrapper);
    if (state.player_turn == "First") {
      return wrapper.game.player1;
    }
    if (state.player_turn == "Second") {
      return wrapper.game.player2;
    }
    return "Unknown";
  }

  static getCurrentPlayerTurnSide(wrapper: GameWrapper): String {
    const state = this.getLastState(wrapper);
    if (state.player_turn == "First") {
      return "Tech";
    }
    if (state.player_turn == "Second") {
      return "Bug";
    }
    return "Unknown";
  }

  static tryToGetLastState(wrapper: GameWrapper | null | undefined): GameState | null {
    if (!wrapper) {
      return null;
    }
    return wrapper.game.states[wrapper.game.states.length - 1];
  }

  static getLastState(wrapper: GameWrapper): GameState {
    return wrapper.game.states[wrapper.game.states.length - 1];
  }

  static getPhase(wrapper: GameWrapper): string {
    return wrapper.game.states[wrapper.game.states.length - 1].turn_phase;
  }

  static getPlayerTurn(wrapper: GameWrapper): string {
    return wrapper.game.states[wrapper.game.states.length - 1].player_turn;
  }

  static reverseGameMapRows(game: Game) {
    game.states[game.states.length - 1].map.reverse();
  }

  static createDefaultWrapper(game: Game, recepies: TileRecipes): GameWrapper {
    return {
      game: game,
      recepies: recepies,
      canvasState: {
        display: [],
        tileSelector: null,
        tileId: null,
      } as DisplayState
    } as GameWrapper;
  }

  static updateWrapperGame(wrapper: GameWrapper, game: Game): GameWrapper {
    return {
      game: game, // grab new game state ; else is same
      recepies: wrapper.recepies,
      canvasState: wrapper.canvasState,
    } as GameWrapper
  }
}
