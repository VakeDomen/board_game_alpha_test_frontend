import { Game } from "./game.model";
import { TileRecipes } from "./recepie.model";

export interface GameWrapper {
    game: Game,
    recepies: TileRecipes
}