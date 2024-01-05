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

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = 300; 
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['wrapper']) {
      this.renderGameState();
    }
  }

  ngAfterViewInit(): void {
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.adjustCanvasSize();
    this.renderGameState();
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustCanvasSize();
    this.renderGameState();
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
    if(!this.wrapper || !this.context || !this.wrapper.game.states.length) {
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

        // Optional: Draw borders for each tile
        this.context.strokeStyle = 'white';
        this.context.strokeRect(col * tileWidth, row * tileHeight, tileWidth, tileHeight);

        // Optional: Add more detailed rendering based on the map values
      }
    }
  }
}
