import { Component, Input, OnInit } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { Stats } from 'src/app/models/recepie.model';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-tile-card',
  templateUrl: './tile-card.component.html',
  styleUrls: ['./tile-card.component.sass']
})
export class TileCardComponent implements OnInit {

  @Input() public key: string = "";
  @Input() public wrapper: GameWrapper | undefined;
  
  constructor() { }

  ngOnInit(): void {
  }



  getCost(key: string) {
    if (!this.wrapper) {
      return []
    }
    return this.wrapper.recepies[key].cost;
  }

  getStats(key: string) {
    if (!this.wrapper) {
      return {
        hp: 0,
        attack: 0,
        range: 0
      } as Stats;
    }
    return this.wrapper.recepies[key].stats;
  }

  getFootprint(key: string) {
    if (!this.wrapper) {
      return []
    }
    return this.wrapper.recepies[key].footprint;
  }

  getName(key: string) {
    return key.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  isBug() {
    return this.key.includes('Bug');
  }

  getBackgroundImageUrl(key: string) {
    return GameService.getBackgroundImageUrl(key);
  }

  canPlace(key: string) {
    if (!this.wrapper) {
      return false;
    }
    if (!GameService.hasResourcesToPlace(this.wrapper, key, this.getPlayerByKey(key))) {
      return false;
    }
    return true
  }

  getPlayerByKey(key: String) {
    if (key.includes("Tech")) {
      return "First";
    } else {
      return "Second";
    }
  }

  isActive(key: string) {
    if (!this.wrapper) {
      return false;
    }
    return this.wrapper.canvasState.tileSelector == key;
  }

  activate(key: string) {
    if (!this.wrapper) {
      return;
    }
    if (!this.canPlace(key)) {
      return;
    }
    if (this.isActive(key)) {
      this.wrapper.canvasState.display = this.wrapper.canvasState.display.filter(item => item != "footprint");
      this.wrapper.canvasState.tileSelector = null;  
    } else {
      this.wrapper.canvasState.display.push("footprint");
      this.wrapper.canvasState.tileSelector = key;
    }
  }
}
