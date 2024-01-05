// canvas.component.ts
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { GameWrapper } from 'src/app/models/game-wrapper.model';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.sass']
})
export class CanvasComponent implements OnChanges {

  @Input() wrapper: GameWrapper | undefined;
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;

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
    console.log("Changes", changes);
    if (changes['wrapper']) {
      this.renderGameState();
    }
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.gameCanvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.gameCanvas.nativeElement.addEventListener('click', this.onCanvasClick.bind(this));
    this.adjustCanvasSize();
    this.renderGameState();
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
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustCanvasSize();
    this.renderGameState();
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
    // Add logic here to handle the click based on the row, column coordinates
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.wrapper) {
      return;
    }
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.hoveredCol = Math.floor(x / (this.canvasWidth / this.wrapper.game.states[this.wrapper.game.states.length - 1].map[0].length));
    this.hoveredRow = Math.floor(y / (this.canvasHeight / this.wrapper.game.states[this.wrapper.game.states.length - 1].map.length));

    this.renderGameState(); // Re-render to update the hovered tile
  }

  private adjustCanvasSize(): void {
    this.canvasWidth = this.gameCanvas.nativeElement.parentElement?.offsetWidth || window.innerWidth;
    if (this.wrapper?.game.states.length) {
      const lastState = this.wrapper.game.states[this.wrapper.game.states.length - 1];
      const rows = lastState.map.length;
      const columns = rows > 0 ? lastState.map[0].length : 0;

      const aspectRatio = columns / rows;
      this.canvasHeight = Math.max(this.canvasWidth / aspectRatio, 300); // Ensure a minimum height of 300px

      const maxHeight = window.innerHeight * 0.8;
      if (this.canvasHeight > maxHeight) {
        this.canvasHeight = maxHeight;
        this.canvasWidth = this.canvasHeight * aspectRatio;
      }

      // Apply these dimensions to the canvas
      this.gameCanvas.nativeElement.width = this.canvasWidth;
      this.gameCanvas.nativeElement.height = this.canvasHeight;
      this.cdr.detectChanges();

    }
  }


  private renderGameState(): void {
    if (!this.wrapper || !this.context || !this.wrapper.game.states.length) {
      console.error("No game wrapper, context, or states available.");
      return;
    }

    // Clear the canvas
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Render the game state
    const lastState = this.wrapper.game.states[this.wrapper.game.states.length - 1];
    this.drawGrid(lastState.map);
  }

  private drawGrid(map: string[][]): void {
    if (!this.context) return;

    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;
    const tileWidth = this.canvasWidth / columns;
    const tileHeight = this.canvasHeight / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        this.context.fillStyle = 'lightgrey'; // Change as needed
        this.context.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

        // Draw borders for each tile
        this.context.strokeStyle = 'white';
        this.context.strokeRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

      }
    }

    this.drawFoorptint(map);
  }
  private drawFoorptint(map: string[][]) {
    if (!this.wrapper || !this.wrapper.canvasState || !this.wrapper.canvasState.tile_selector || !this.context) {
      console.log("Something not here", this.wrapper);
      return;
    }
    const rows = map.length;
    const columns = rows > 0 ? map[0].length : 0;
    const footprint = this.wrapper.recepies[this.wrapper.canvasState.tile_selector]?.footprint;
    const tileWidth = this.canvasWidth / columns;
    const tileHeight = this.canvasHeight / rows;

    console.log("shoud", footprint)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {

        // Check if we're displaying footprint and if this tile is within the footprint
        if (this.wrapper.canvasState.display === 'footprint' && footprint && this.hoveredRow !== null && this.hoveredCol !== null) {
          const footprintRow = row - this.hoveredRow;
          const footprintCol = col - this.hoveredCol;

          // Check if the current tile is within the footprint bounds
          if (footprintRow >= 0 && footprintRow < footprint.length && footprintCol >= 0 && footprintCol < footprint[footprintRow].length && footprint[footprintRow][footprintCol]) {
            this.context.fillStyle = 'lightyellow'; // Semi-transparent green for footprint
          } else {
            this.context.fillStyle = 'lightgrey';
          }

          this.context.fillRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

          // Draw borders for each tile
          this.context.strokeStyle = 'white';
          this.context.strokeRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        } else {
          console.log("Drek")
          this.context.fillStyle = 'lightgrey';
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
