export interface GameState {
    player_turn: string;
    winner: string | null;
    turn_phase: string;
    turn: number;
    tiles: Record<string, Tile>; // Specify the structure more precisely if possible
    move_que: any[]; // Specify the type of elements if possible
    executed_moves: any[]; // Specify the type of elements if possible
    tech_resources: string[]; // Specify the type of elements if possible
    bug_resources: string[]; // Specify the type of elements if possible
    map: string[][]; // Assuming all elements in map arrays are strings
}

export interface Game {
    name: string;
    player1: string;
    player2: string;
    states: GameState[];
}

export interface Tile {
    activated: boolean;
    activation_resources: any[];  // Assuming array of a certain type, replace 'any' with the actual type if known
    additional_data: {[key: string]: any}; // Object with string keys and any type of values
    dmg_delt: number;
    dmg_recieved: number;
    exhausted: boolean;
    id: string;
    owner: string;
    rotated: boolean;
    tile_type: string;
    x: number;
    y: number;
}
