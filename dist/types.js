export class GameState {
    gameID;
    players;
    current_player;
    claiming_player;
    statusMessages;
    revealDiceVal = 0;
    currentClaim = new Claim();
    constructor(gameID, players = [], current_player = new Player('', ''), claiming_player = null, statusMessages = [], revealDiceVal = 0, currentClaim = new Claim()) {
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
    count;
    diceVal;
    constructor(count = 0, diceVal = 0) {
        this.count = count;
        this.diceVal = diceVal;
    }
}
export class Player {
    name;
    id;
    lives;
    claim;
    dice;
    status;
    constructor(name, id, lives = 5, claim = new Claim(), dice = [], status = Status.WAITING) {
        this.name = name;
        this.id = id;
        this.lives = lives;
        this.claim = claim;
        this.dice = dice;
        this.status = status;
    }
}
export var Status;
(function (Status) {
    Status["WAITING"] = "Waiting";
    Status["THINKING"] = "Thinking";
    Status["CLAIM"] = "Claim";
    Status["DOUBT"] = "Doubt";
    Status["OOPS"] = "Oops";
    Status["HEH"] = "Heh";
    Status["DEAD"] = "Dead";
    Status["WINNER"] = "Winner";
})(Status || (Status = {}));
//# sourceMappingURL=types.js.map