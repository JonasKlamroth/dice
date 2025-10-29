
export class GameState {
    gameID: number;
    players: Player[];
    current_player: Player;
    claiming_player: Player | null;
    statusMessages: string[];
    revealDiceVal : number = 0; 
    currentClaim: Claim = new Claim();

    constructor(gameID : number, 
        players = [], 
        current_player = new Player('', ''), 
        claiming_player = null, 
        statusMessages = [], 
        revealDiceVal = 0,
    currentClaim = new Claim()) {

        this.gameID = gameID;
        this.players = players;
        this.current_player = current_player;
        this.claiming_player = claiming_player;
        this.statusMessages = statusMessages;
        this.revealDiceVal = revealDiceVal;
        this.currentClaim = currentClaim;
    }
}

export class Claim {
    count: number;
    diceVal: number;
    constructor(count = 0, diceVal = 0) {
        this.count = count;
        this.diceVal = diceVal;
    }
}

export class Player {
    name: string;
    id: string;
    lives: number;
    claim: Claim;
    dice: number[];
    status: Status;
    constructor(name: string, id: string, lives = 5, claim = new Claim(), dice = [], status = Status.WAITING) {
        this.name = name;
        this.id = id;
        this.lives = lives;
        this.claim = claim;
        this.dice = dice;
        this.status = status;
    }
}

export enum Status {
    WAITING = 'Waiting',
    THINKING = 'Thinking',
    CLAIM = 'Claim',
    DOUBT = 'Doubt',
    OOPS = 'Oops',
    HEH = 'Heh',
    DEAD = 'Dead',
    WINNER = 'Winner',
}