import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

@Component({
  selector: 'app-phase-end',
  templateUrl: './phase-end.component.html',
  styleUrls: ['./phase-end.component.sass']
})
export class PhaseEndComponent implements OnInit {

  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
