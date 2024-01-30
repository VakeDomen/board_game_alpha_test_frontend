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

  static hasResourcesToPlace(wrapper: GameWrapper, key: string, player: string): boolean {
    const recipe = wrapper.recepies[key];
    if (!recipe) {
      return false;
    }

    const resources = this.getPlayerResources(wrapper, player);
    const cost = recipe.cost;

    // Count the resources the player has
    const resourceCounts = resources.reduce((acc, resource) => {
      acc[resource] = (acc[resource] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});

    // Check if the player has enough of each resource required by the recipe
    for (const resourceNeeded of cost) {
        if (!resourceCounts[resourceNeeded] || resourceCounts[resourceNeeded] == 0) {
            return false; // Not enough of this resource
        }
        resourceCounts[resourceNeeded]--;
    }

    return true; // Player has all the resources needed
}


  static getPlayerResources(wrapper: GameWrapper, player: string) {
    if (player == 'First') {
      return this.getLastState(wrapper).tech_resources;
    } else {
      return this.getLastState(wrapper).bug_resources;
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

  static getBackgroundImageUrl(key: string): string {
    if (key == 'TechRefinery1') return "assets/tech/furnace.png";
    if (key == 'TechRefinery2') return "assets/tech/furnace-1.png";
    if (key == 'TechRoad') return "assets/tech/road.png";
    if (key == 'TechArtillery1') return "assets/tech/anti-aircraft-gun.png";
    if (key == 'TechArtillery2') return "assets/tech/anti-aircraft-gun.png";
    if (key == 'TechTurret1') return "assets/tech/turret.png";
    if (key == 'TechTurret2') return "assets/tech/turret-1.png";
    if (key == 'TechMine1') return "assets/tech/mine-wagon.png";
    if (key == 'TechMine2') return "assets/tech/mine-wagon-1.png";
    if (key == 'TechNuke') return "assets/tech/nuclear-bomb.png";
    if (key == 'TechWall1') return "assets/tech/brick-wall.png";
    if (key == 'TechMarket') return "assets/tech/trade.png";
    if (key == 'TechBase') return "assets/general/health-normal.png";
    if (key == 'BugBase1') return "assets/bug/nest-eggs.png";
    if (key == 'BugBase2') return "assets/bug/nest-eggs1.png";
    if (key == 'BugBase3') return "assets/bug/nest-eggs2.png";
    if (key == 'BugSoldierLV1') return "assets/bug/maggot.png";
    if (key == 'BugSoldierLV2') return "assets/bug/maggot-1.png";
    if (key == 'BugSoldierLV3') return "assets/bug/maggot-2.png";
    if (key == 'BugEliteMelee') return "assets/bug/alien-bug.png";
    if (key == 'BugEliteRanged') return "assets/bug/alien-bug.png";
    return "assets/general/health-normal.png";
  }

  static getTileTypeById(wrapper: GameWrapper, tileId: string) {
    const state = GameService.getLastState(wrapper);
    return state.tiles[tileId].tile_type;
  }

  static getImageUrl(wrapper: GameWrapper, tileId: string) {
    return this.getBackgroundImageUrl(this.getTileTypeById(wrapper, tileId));
  }

  static getTileActiveCost(wrapper: GameWrapper, key: string) {
    const selector = this.getTileTypeById(wrapper, key);
    return wrapper.recepies[selector].activated_costs;
  }

  static isActivePlayersTile(wrapper: GameWrapper, id: string) {
    const state = this.getLastState(wrapper);
    return state.player_turn == state.tiles[id].owner;
  }
}
