// canvas.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef, Output, EventEmitter, NgZone } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';
import { GameService } from 'src/app/services/game.service';

export interface Tile {
  x: number,
  y: number,
  id: string,
}
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.sass']
})
export class CanvasComponent implements OnChanges {

  @Input() wrapper: GameWrapper | undefined;
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;

  @Output() tileClick = new EventEmitter<Tile>();

  private context!: CanvasRenderingContext2D | null;
  private tileSize!: { width: number; height: number; };
  private preloadedImages: { [key: string]: HTMLImageElement } = {};


  private hoveredRow: number | null = null;
  private hoveredCol: number | null = null;
  private rendering: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnChanges(changes: SimpleChanges): void { }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.gameCanvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.gameCanvas.nativeElement.addEventListener('click', this.onCanvasClick.bind(this));
    this.adjustCanvasSize();
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!lastState) {
      return;
    }
    const rows = lastState.map.length;
    const columns = rows > 0 ? lastState.map[0].length : 0;
    this.tileSize = {
      width: this.gameCanvas.nativeElement.width / columns,
      height: this.gameCanvas.nativeElement.height / rows
    };
    this.initDrawLoop();
  }

  ngOnDestroy(): void {
    this.rendering = false;
  }

  private async initDrawLoop() {
    this.preloadedImages = await this.preloadImages();
    this.drawLoop();
  }

  private async drawLoop(): Promise<void> {
    if (this.rendering) {
      this.renderGameState();
      requestAnimationFrame(() => this.drawLoop());
    }
  }



  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustCanvasSize();
  }

  private onCanvasClick(event: MouseEvent): void {
    let [clickedRow, clickedColumn] = this.getTileOnLocation(event.clientX, event.clientY);
    // Now you can handle the click based on the tile
    this.handleClickOnTile(clickedRow, clickedColumn);
  }

  private handleClickOnTile(row: number, column: number): void {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    this.tileClick.emit({
      x: row,
      y: column,
      id: lastState ? lastState.map[row][column] : ""
    });
  }

  private getTileOnLocation(xAbsolute: number, yAbsolute: number): [number, number] {
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = xAbsolute - rect.left; // x position within the canvas
    const y = yAbsolute - rect.top;  // y position within the canvas

    // Calculate which tile was clicked
    const clickedRow = Math.floor(y / this.tileSize.height);
    const clickedColumn = Math.floor(x / this.tileSize.width);

    return [clickedRow, clickedColumn]
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.wrapper || !this.context) {
      return;
    }
    let [row, col] = this.getTileOnLocation(event.clientX, event.clientY);
    this.hoveredRow = row;
    this.hoveredCol = col;
  }

  private adjustCanvasSize(): void {
    // Get the parent element's width or the window width, whichever is smaller
    const maxWidth = this.gameCanvas.nativeElement.parentElement?.offsetWidth || window.innerWidth;
    this.gameCanvas.nativeElement.width = Math.min(maxWidth, window.innerWidth);

    // Calculate height based on the aspect ratio and CSS rules
    // For screens wider than 767px, use 75vh, otherwise use 90vh
    const viewportHeight = window.innerHeight;
    const cssHeightVh = window.innerWidth > 767 ? 75 : 90;
    this.gameCanvas.nativeElement.height = viewportHeight * (cssHeightVh / 100);

    if (this.wrapper) {
      const tileRows = this.wrapper.game.states[this.wrapper.game.states.length - 1].map.length;
      const tileCols = this.wrapper.game.states[this.wrapper.game.states.length - 1].map[0].length;
      const tilexHeight = Math.floor(this.gameCanvas.nativeElement.height / tileRows);
      const tilexWidth = tilexHeight;
      this.gameCanvas.nativeElement.width = tileCols * tilexWidth;
      this.tileSize = {
        width: tilexWidth,
        height: tilexHeight,
      };
    }
    this.cdr.detectChanges();
  }



  private renderGameState(): void {
    if (!this.wrapper || !this.context || !this.wrapper.game.states.length) {
      return;
    }

    // Clear the canvas
    this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    // Render the game state
    const lastState = this.wrapper.game.states[this.wrapper.game.states.length - 1];
    this.drawGrid(lastState.map);
  }

  private async preloadImages(): Promise<any> {
    if (!this.wrapper) {
      return;
    }
    const imageLoadPromises: Promise<HTMLImageElement>[] = [];
    const loadedImages: { [key: string]: HTMLImageElement } = {};
    for (const key in this.wrapper.recepies) {
      const imageUrl = GameService.getBackgroundImageUrl(key);
      const image = new Image();
      image.src = imageUrl;
      loadedImages[key] = image;
      imageLoadPromises.push(new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
      }));
    }
    await Promise.all(imageLoadPromises);
    return loadedImages;
  }
  private async drawGrid(map: string[][]): Promise<void> {
    if (!this.context || !this.wrapper) return;

    this.drawTileFaces(map);

    if (this.wrapper.canvasState.display.includes('setup')) {
      this.drawSetupSpaces(map);
    }

    if (this.wrapper.canvasState.display.includes('footprint')) {
      this.drawFootprint(map);
    }

    if (this.wrapper.canvasState.display.includes('actives')) {
      this.drawActiveAbilityShine(map);
    }
  }

  private drawActiveAbilityShine(map: string[][]) {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!this.context || !this.wrapper || !lastState) return;

    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (map[row][col] != "" && GameService.isActivePlayersTile(this.wrapper, map[row][col])) {
          const selector = GameService.getTileTypeById(this.wrapper, map[row][col]);
          const tile = lastState.tiles[map[row][col]];
          const recepie = this.wrapper.recepies[selector];

          if (!tile || !recepie) {
            continue;
          }
          
          if (!tile.activated && !tile.exhausted && recepie.activated_costs.length) {
            const prevAlpha = this.context.globalAlpha;
            this.context.globalAlpha = 0.3;
            this.setPlayerTurnColor();
            
            this.context.fillRect(
              col * this.tileSize.width, 
              row * this.tileSize.height, 
              this.tileSize.width, 
              this.tileSize.height
            );
            this.context.globalAlpha = prevAlpha;
          }

        }
        
      }
    }
  }


  setPlayerTurnColor() {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!this.context || !this.wrapper || !lastState) return;

    this.context.fillStyle = 'blue';
    if (lastState.player_turn == 'Second') {
      this.context.fillStyle = 'red';
    }
  }

  setPlayerTileColor(id: string) {
    if (!this.context || !this.wrapper) return;

    const selector = GameService.getTileTypeById(this.wrapper, id);
          
    this.context.fillStyle = 'blue';
    if (selector.includes("Bug")) {
      this.context.fillStyle = 'red';
    }
  }

  private drawTileFaces(map: string[][]) {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!this.context || !this.wrapper || !lastState) return;

    const coveredTiles = new Set<string>();

    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[0].length; col++) {
        const tileKey = `${row},${col}`;
        if (coveredTiles.has(tileKey)) {
          continue;
        }

        const tileId = lastState.map[row][col];
        if (tileId != "") {
          const tileType = GameService.getTileTypeById(this.wrapper, tileId);
          const image = this.preloadedImages[tileType];
          const footprint = this.wrapper.recepies[tileType]?.footprint;

          if (!footprint || !image) {
            continue;
          }

          if (tileType === "BugBase2") {
            // Special rendering for BugBase2
            const centerRow = row + 1;
            const centerCol = col;

            if (this.context) {
              this.context.fillStyle = 'black';
              for (let fRow = 0; fRow <= 2; fRow++) {
                for (let fCol = -1; fCol <= 1; fCol++) {
                  const fTileKey = `${row + fRow},${col + fCol}`;


                  if (row + fRow == centerRow && col + fCol == centerCol) {
                    this.context.drawImage(
                      image,
                      centerCol * this.tileSize.width,
                      centerRow * this.tileSize.height,
                      this.tileSize.width,
                      this.tileSize.height
                    );
                    coveredTiles.add(fTileKey);
                  } else if (row + fRow == centerRow || col + fCol == centerCol) {
                    this.context.fillRect(
                      (col + fCol) * this.tileSize.width,
                      (row + fRow) * this.tileSize.height,
                      this.tileSize.width,
                      this.tileSize.height
                    );
                    coveredTiles.add(fTileKey);
                  }
                }
              }
            }
          } else {
            // Default rendering for other tiles
            const footprintWidth = footprint[0].length * this.tileSize.width;
            const footprintHeight = footprint.length * this.tileSize.height;
            const startX = col * this.tileSize.width;
            const startY = row * this.tileSize.height;

            if (this.context) {
              this.context.drawImage(image, startX, startY, footprintWidth, footprintHeight);
            }

            // Mark all tiles in the footprint as covered
            for (let fRow = 0; fRow < footprint.length; fRow++) {
              for (let fCol = 0; fCol < footprint[0].length; fCol++) {
                if (footprint[fRow][fCol]) {
                  coveredTiles.add(`${row + fRow},${col + fCol}`);
                }
              }
            }
          }
        } else {
          this.context.fillStyle = 'lightgrey';
          this.context.fillRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
        }

        if (!coveredTiles.has(tileKey)) {
          this.context.strokeStyle = 'white';
          this.context.strokeRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
        }
      }
    }
  }



  private drawSetupSpaces(map: string[][]) {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!this.context || !this.wrapper || !lastState) return;

    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (map[row][col] == "" && row < rows / 2) {
          this.context.fillStyle = "#ffcccc"
          this.context.fillRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
          this.context.strokeStyle = 'white';
          this.context.strokeRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
        }
      }
    }
  }

  private drawFootprint(map: string[][]) {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (
      !lastState ||
      !this.wrapper ||
      !this.wrapper.canvasState ||
      !this.wrapper.canvasState.tileSelector ||
      !this.context
    ) {
      return;
    }


    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;
    const footprint = this.wrapper.recepies[this.wrapper.canvasState.tileSelector]?.footprint;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {

        // Check if we're displaying footprint and if this tile is within the footprint
        if (
          footprint &&
          this.hoveredRow !== null &&
          this.hoveredCol !== null
        ) {

          let anchorRow = this.hoveredRow;
          let anchorCol = this.hoveredCol;

          if (lastState.player_turn == "First") {
            anchorRow -= (footprint.length - 1);
          }
          /// Subtract the dimensions of the footprint to anchor at the bottom-right corner
          const footprintRow = row - anchorRow;
          const footprintCol = col - anchorCol;

          // Check if the current tile is within the footprint bounds
          if (
            footprintRow >= 0 &&
            footprintRow < footprint.length &&
            footprintCol >= 0 &&
            footprintCol < footprint[footprintRow].length &&
            footprint[footprintRow][footprintCol]
          ) {
            this.context.fillStyle = 'lightyellow';
            this.context.fillRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
            // Draw borders for each tile
            this.context.strokeStyle = 'white';
            this.context.strokeRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);
          }
        }
      }
    }
  }

  

  

  
}
