// canvas.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

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
  private canvasWidth: number;
  private canvasHeight: number;
  private tileSize!: { width: number; height: number; };


  private hoveredRow: number | null = null;
  private hoveredCol: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = 300;
  }


  ngOnChanges(changes: SimpleChanges): void {
    console.log("CANVAS CHANGES ")
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.gameCanvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.gameCanvas.nativeElement.addEventListener('click', this.onCanvasClick.bind(this));
    this.adjustCanvasSize();
    const lastState = this.getLastState();
    if (!lastState) {
      return;
    }
    const rows = lastState.map.length;
    const columns = rows > 0 ? lastState.map[0].length : 0;
    this.tileSize = {
      width: this.canvasWidth / columns,
      height: this.canvasHeight / rows
    };

    setInterval(() => this.renderGameState(), 26);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustCanvasSize();
  }

  private onCanvasClick(event: MouseEvent): void {
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // x position within the canvas
    const y = event.clientY - rect.top;  // y position within the canvas

    // Calculate which tile was clicked
    const clickedRow = Math.floor(y / this.tileSize.height);
    const clickedColumn = Math.floor(x / this.tileSize.width);

    // Now you can handle the click based on the tile
    this.handleClickOnTile(clickedRow, clickedColumn);
  }

  private handleClickOnTile(row: number, column: number): void {
    const lastState = this.getLastState();
    this.tileClick.emit({
      x: row,
      y: column,
      id: lastState ? lastState.map[row][column] : ""
    });
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.wrapper || !this.context) {
      return;
    }
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    console.log(rect, event)
    // const x = event.clientX - rect.x + window.scrollX;
    // const y = event.clientY - rect.y + window.scrollY;
    const devicePixelRatio = window.devicePixelRatio || 1;
    console.log(devicePixelRatio);
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top) ;

    this.context.fillStyle = "red"
    this.context.beginPath()
    this.context.arc(x, y, 3, 0, 2*Math.PI);
    this.context.fill();

    const lastState = this.wrapper.game.states[this.wrapper.game.states.length - 1];
    const rows = lastState.map.length;
    const columns = rows > 0 ? lastState.map[0].length : 0;

    // Calculate the size of each tile
    const tileWidth = this.canvasWidth / columns;
    const tileHeight = this.canvasHeight / rows;

    // Calculate hovered tile based on the tile size
    this.hoveredCol = Math.floor(x / tileWidth);
    this.hoveredRow = Math.floor(y / tileHeight);
  }

  private adjustCanvasSize(): void {
    // Get the parent element's width or the window width, whichever is smaller
    const maxWidth = this.gameCanvas.nativeElement.parentElement?.offsetWidth || window.innerWidth;
    this.canvasWidth = Math.min(maxWidth, window.innerWidth);

    // Calculate height based on the aspect ratio and CSS rules
    // For screens wider than 767px, use 75vh, otherwise use 90vh
    const viewportHeight = window.innerHeight;
    const cssHeightVh = window.innerWidth > 767 ? 75 : 90;
    this.canvasHeight = viewportHeight * (cssHeightVh / 100);

    if (this.wrapper) {
      const tileRows = this.wrapper.game.states[this.wrapper.game.states.length - 1].map.length;
      const tileCols = this.wrapper.game.states[this.wrapper.game.states.length - 1].map[0].length;
      const tileHeight = Math.floor(this.canvasHeight / tileRows);
      const tileWidth = tileHeight;
      this.canvasWidth = tileCols * tileWidth;
    }

    // Adjust the canvas size
    this.gameCanvas.nativeElement.width = this.canvasWidth;
    this.gameCanvas.nativeElement.height = this.canvasHeight;
    this.cdr.detectChanges();
  }



  private renderGameState(): void {

    if (!this.wrapper || !this.context || !this.wrapper.game.states.length) {
      return;
    }

    // Clear the canvas
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Render the game state
    const lastState = this.wrapper.game.states[this.wrapper.game.states.length - 1];
    this.drawGrid(lastState.map);
  }

  private drawGrid(map: string[][]): void {
    const lastState = this.getLastState()
    if (!this.context || !lastState) return;

    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;
    const tileWidth = this.canvasWidth / columns;
    const tileHeight = this.canvasHeight / rows;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        this.context.fillStyle = 'lightgrey'; // Change as needed

        if (lastState.map[row][col] != "") {
          this.context.fillStyle = "orange"
        }

        this.context.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

        // Draw borders for each tile
        this.context.strokeStyle = 'white';
        this.context.strokeRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

      }
    }

    this.drawFoorptint(map);
  }
  private drawFoorptint(map: string[][]) {
    const lastState = this.getLastState();
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
    const tileWidth = this.canvasWidth / columns;
    const tileHeight = this.canvasHeight / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {

        // Check if we're displaying footprint and if this tile is within the footprint
        if (
          this.wrapper.canvasState.display === 'footprint' &&
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

          // const footprintRow = row - this.hoveredRow;
          // const footprintCol = col - this.hoveredCol;

          // Check if the current tile is within the footprint bounds
          if (
            footprintRow >= 0 &&
            footprintRow < footprint.length &&
            footprintCol >= 0 &&
            footprintCol < footprint[footprintRow].length &&
            footprint[footprintRow][footprintCol]
          ) {
            this.context.fillStyle = 'lightyellow'; // Semi-transparent green for footprint
            this.context.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
            // Draw borders for each tile
            this.context.strokeStyle = 'white';
            this.context.strokeRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
          }


        }

      }
    }
  }

  getLastState() {
    if (!this.wrapper) {
      return null;
    }
    return this.wrapper.game.states[this.wrapper.game.states.length - 1];
  }
}
