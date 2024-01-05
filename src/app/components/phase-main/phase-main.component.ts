import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

@Component({
  selector: 'app-phase-main',
  templateUrl: './phase-main.component.html',
  styleUrls: ['./phase-main.component.sass']
})
export class PhaseMainComponent implements OnInit {
  
  @Input() wrapper: GameWrapper | undefined;
  @Output() wrapperUpdate = new EventEmitter<GameWrapper>();
  
  constructor() { }

  ngOnInit(): void {
  }

}
