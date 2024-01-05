import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

@Component({
  selector: 'app-phase-triggers',
  templateUrl: './phase-triggers.component.html',
  styleUrls: ['./phase-triggers.component.sass']
})
export class PhaseTriggersComponent implements OnInit {
  
  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
