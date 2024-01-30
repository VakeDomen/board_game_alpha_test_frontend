import { Game } from "./game.model";
import { TileRecipes } from "./recepie.model";

export interface GameWrapper {
    game: Game,
    recepies: TileRecipes,
    canvasState: DisplayState,
}

export interface DisplayState {
    display: DisplayTag[];
    tileSelector: string | null,
    tileId: string | null,
}

export type DisplayTag = 'footprint' | 'range' | 'setup' | 'dmg' | 'main' | 'actives';