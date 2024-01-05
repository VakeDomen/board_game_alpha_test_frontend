import { Game } from "./game.model";
import { TileRecipes } from "./recepie.model";

export interface GameWrapper {
    game: Game,
    recepies: TileRecipes,
    canvasState: DisplayState,
}

export interface DisplayState {
    display: null | 'footprint' | 'range';
    tile_selector: string | null,
    tile_id: string | null,
}