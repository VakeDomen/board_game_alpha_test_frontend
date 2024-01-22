import { Component, Input, OnInit } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { Stats } from 'src/app/models/recepie.model';

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
    if (key == 'TechWall1') return "assets/tech/stone-wall.png";
    if (key == 'TechMarket') return "assets/tech/trade.png";
    if (key == 'TechBase') return "assets/tech/health-normal.png";
    if (key == 'BugBase1') return "assets/tech/nest-eggs.png";
    if (key == 'BugBase2') return "assets/tech/nest-eggs-1.png";
    if (key == 'BugBase3') return "assets/tech/nes-eggs-2.png";
    if (key == 'BugSoldierLV1') return "assets/bug/maggot.png";
    if (key == 'BugSoldierLV2') return "assets/bug/maggot-1.png";
    if (key == 'BugSoldierLV3') return "assets/bug/maggot-2.png";
    if (key == 'BugEliteMelee') return "assets/bug/alien-bug.png";
    if (key == 'BugEliteRanged') return "assets/bug/alien-bug.png";
    return "assets/general/health-normal.png";
  }
}
