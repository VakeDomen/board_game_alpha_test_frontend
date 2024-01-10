import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DisplayState, GameWrapper } from 'src/app/models/game-wrapper.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-phase-setup',
  templateUrl: './phase-setup.component.html',
  styleUrls: ['./phase-setup.component.sass']
})
export class PhaseSetupComponent implements OnInit {
  
  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  constructor() { }

  ngOnInit(): void {
    const state: DisplayState = {
      display: ['footprint', 'setup'],
      tileSelector: GameService.tryToGetLastState(this.wrapper)?.player_turn == 'First' ? 'TechBase' : 'BugBase1',
      tileId: null
    };
    if (!this.wrapper) {
      return
    }
    this.wrapper.canvasState = state;
    this.wrapperUpdate.emit(this.wrapper);
  }


}
