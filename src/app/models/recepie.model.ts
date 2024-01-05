export interface TileRecipe {
    cost: string[];
    footprint: boolean[][];
    required_spaced_placement: boolean;
    required_road_connection: boolean;
    stats: Stats;
    activated_costs: string[][];
}

export interface Stats {
    hp: number;
    attack: number;
    range: number;
}

export interface TileRecipes {
    [key: string]: TileRecipe;
}
