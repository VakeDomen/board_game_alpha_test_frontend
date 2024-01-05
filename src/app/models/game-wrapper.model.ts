import { Game } from "./game.model";
import { TileRecipes } from "./recepie.model";

export interface GameWrapper {
    game: Game,
    recepies: TileRecipes,
    canvasState: DisplayState,
}

export interface DisplayState {
    display: null | 'footprint' | 'range';
    tileSelector: string | null,
    tileId: string | null,
}