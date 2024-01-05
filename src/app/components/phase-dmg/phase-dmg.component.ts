import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

@Component({
  selector: 'app-phase-dmg',
  templateUrl: './phase-dmg.component.html',
  styleUrls: ['./phase-dmg.component.sass']
})
export class PhaseDmgComponent implements OnInit {

  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
