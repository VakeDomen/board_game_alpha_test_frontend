import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-resource-panel',
  templateUrl: './resource-panel.component.html',
  styleUrls: ['./resource-panel.component.sass']
})
export class ResourcePanelComponent implements OnChanges {

  @Input() wrapper: GameWrapper | undefined;

  public bugPrimary: number = 0;
  public bugSecondary: number = 0; 
  public bugUnique: number = 0;
  public techPrimary: number = 0;
  public techSecondary: number = 0;

  constructor() { }

  ngOnChanges(): void {
    if (!this.wrapper) {
      return;
    }
    this.bugPrimary = GameService.getLastState(this.wrapper).bug_resources.filter(r => r == 'Egg').length;
    this.bugSecondary = GameService.getLastState(this.wrapper).bug_resources.filter(r => r == 'Corpse').length;
    this.bugUnique = GameService.getLastState(this.wrapper).bug_resources.filter(r => r == 'GiantEgg').length;
    this.techPrimary = GameService.getLastState(this.wrapper).tech_resources.filter(r => r == 'Gold').length;
    this.techSecondary = GameService.getLastState(this.wrapper).tech_resources.filter(r => r == 'Metal').length;
  }

}
