export interface GameState {
    player_turn: string;
    winner: string | null;
    turn_phase: string;
    turn: number;
    tiles: Record<string, any>; // Specify the structure more precisely if possible
    move_que: any[]; // Specify the type of elements if possible
    executed_moves: any[]; // Specify the type of elements if possible
    tech_resources: any[]; // Specify the type of elements if possible
    bug_resources: any[]; // Specify the type of elements if possible
    map: string[][]; // Assuming all elements in map arrays are strings
}

export interface Game {
    name: string;
    player1: string;
    player2: string;
    states: GameState[];
}