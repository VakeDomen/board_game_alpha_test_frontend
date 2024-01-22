import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DisplayState, DisplayTag, GameWrapper } from 'src/app/models/game-wrapper.model';
import { Stats } from 'src/app/models/recepie.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-phase-main',
  templateUrl: './phase-main.component.html',
  styleUrls: ['./phase-main.component.sass']
})
export class PhaseMainComponent implements OnChanges {

  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  private game: string = "";

  public playerTurn: string = "";

  constructor() { }

  ngOnChanges(): void {
    if (!this.wrapper) {
      return
    }
    if (this.game == JSON.stringify(this.wrapper)) {
      return;
    }

    this.playerTurn = GameService.getPlayerTurn(this.wrapper);
    const display: DisplayTag[] = [];
    if (GameService.isMyTurn(this.wrapper)) {
      display.push('main');
    }
    const state: DisplayState = {
      display: display,
      tileSelector: GameService.tryToGetLastState(this.wrapper)?.player_turn == 'First' ? 'TechBase' : 'BugBase1',
      tileId: null
    };
    if (!this.wrapper) {
      return
    }
    this.wrapper.canvasState = state;
    this.game = JSON.stringify(this.wrapper)
    this.wrapperUpdate.emit(this.wrapper);
  }


  // "BugEliteRanged"
  // "BugSoldierLV1"
  // "BugSoldierLV2"
  // "BugSoldierLV3"
  // "BugEliteMelee" 
  public getSecondPlayerUnits() {
    if (!this.wrapper) {
      return []
    }
    const things = [];
    for (const key in this.wrapper.recepies) {
      if (key.includes("Bug")) {
        things.push(key);
      }
    }
    return things;
    // this.wrapper.recepies.
  }


  public getFirstPlayerUnits() {
    if (!this.wrapper) {
      return []
    }
    const things = [];
    for (const key in this.wrapper.recepies) {
      if (key.includes("Tech")) {
        things.push(key);
      }
    }
    return things;
  }

}
