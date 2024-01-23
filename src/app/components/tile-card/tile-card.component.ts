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
    if (key == 'TechRefinery1') return "assets/tech/furnace.png";
    if (key == 'TechRefinery2') return "assets/tech/furnace-1.png";
    if (key == 'TechRoad') return "assets/tech/road.png";
    if (key == 'TechArtillery1') return "assets/tech/anti-aircraft-gun.png";
    if (key == 'TechArtillery2') return "assets/tech/anti-aircraft-gun.png";
    if (key == 'TechTurret1') return "assets/tech/turret.png";
    if (key == 'TechTurret2') return "assets/tech/turret-1.png";
    if (key == 'TechMine1') return "assets/tech/mine-wagon.png";
    if (key == 'TechMine2') return "assets/tech/mine-wagon-1.png";
    if (key == 'TechNuke') return "assets/tech/nuclear-bomb.png";
    if (key == 'TechWall1') return "assets/tech/brick-wall.png";
    if (key == 'TechMarket') return "assets/tech/trade.png";
    if (key == 'TechBase') return "assets/general/health-normal.png";
    if (key == 'BugBase1') return "assets/bug/nest-eggs.png";
    if (key == 'BugBase2') return "assets/bug/nest-eggs1.png";
    if (key == 'BugBase3') return "assets/bug/nest-eggs2.png";
    if (key == 'BugSoldierLV1') return "assets/bug/maggot.png";
    if (key == 'BugSoldierLV2') return "assets/bug/maggot-1.png";
    if (key == 'BugSoldierLV3') return "assets/bug/maggot-2.png";
    if (key == 'BugEliteMelee') return "assets/bug/alien-bug.png";
    if (key == 'BugEliteRanged') return "assets/bug/alien-bug.png";
    return "assets/general/health-normal.png";
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
