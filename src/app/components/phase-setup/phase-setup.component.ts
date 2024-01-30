import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DisplayState, DisplayTag, GameWrapper } from 'src/app/models/game-wrapper.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-phase-setup',
  templateUrl: './phase-setup.component.html',
  styleUrls: ['./phase-setup.component.sass']
})
export class PhaseSetupComponent implements OnChanges {
  
  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  private game: string = "";

  constructor() { }

  ngOnChanges(): void {
    if (!this.wrapper) {
      return
    }
    if (this.game == JSON.stringify(this.wrapper)) {
      return;
    }


    const lastState = GameService.getLastState(this.wrapper);
    const display: DisplayTag[] = [];
    if (GameService.isMyTurn(this.wrapper) && lastState.move_que.length == 0) {
      display.push('setup');
      display.push('footprint');
    }

    const state: DisplayState = {
      display: display,
      tileSelector: lastState.player_turn == 'First' ? 'TechBase' : 'BugBase1',
      tileId: null
    };
    if (!this.wrapper) {
      return
    }
    this.wrapper.canvasState = state;
    this.game = JSON.stringify(this.wrapper)
    this.wrapperUpdate.emit(this.wrapper);
  }


}
