import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DisplayState, DisplayTag, GameWrapper } from 'src/app/models/game-wrapper.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-phase-dmg',
  templateUrl: './phase-dmg.component.html',
  styleUrls: ['./phase-dmg.component.sass']
})
export class PhaseDmgComponent implements OnChanges {

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

    const display: DisplayTag[] = [];
    if (GameService.isMyTurn(this.wrapper)) {
      display.push('dmg');
    }
    const state: DisplayState = {
      display: display,
      tileSelector: null,
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
