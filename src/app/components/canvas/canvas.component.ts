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
    this.drawLoop();
  }

  ngOnDestroy(): void {
    this.rendering = false;
  }

  private drawLoop(): void {
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
    let [clickedRow, clickedColumn ] = this.getTileOnLocation(event.clientX, event.clientY);
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

  private drawGrid(map: string[][]): void {
    const lastState = GameService.tryToGetLastState(this.wrapper);
    if (!this.context || !this.wrapper || !lastState) return;

    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[0].length; col++) {
        this.context.fillStyle = 'lightgrey'; // Change as needed

        if (lastState.map[row][col] != "") {
          this.context.fillStyle = "orange"
        }

        this.context.fillRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);

        // Draw borders for each tile
        this.context.strokeStyle = 'white';
        this.context.strokeRect(col * this.tileSize.width, row * this.tileSize.height, this.tileSize.width, this.tileSize.height);

      }
    }


    if (this.wrapper.canvasState.display.includes('setup')) {
      this.drawSetupSpaces(map);
    }

    if (this.wrapper.canvasState.display.includes('footprint')) {
      this.drawFoorptint(map);
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
  private drawFoorptint(map: string[][]) {
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
