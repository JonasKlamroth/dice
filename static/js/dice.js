import { Claim, Status } from './types.js';
import * as doc from './docInteraction.js';
const socket = io("http://192.168.178.52:5000");
socket.on('connect', () => {
    var playerID = getPlayerIdFromCookie();
    if (playerID == null) {
        console.debug("Did not find old player ID. Default to 0.");
        playerID = "0";
    }
    else {
        localStorage.setItem("DICE_currentPlayerId", playerID);
    }
    socket.emit('register_player', playerID, socket.id);
});
socket.on('update_game_state', (gameState) => { updateUI(gameState); });
socket.on('update_players', (playerString, isHost) => {
    updateLobby(playerString, isHost);
});
function updateLobby(playersString, isHost) {
    const infoEl = document.getElementById('info-section');
    infoEl.innerText = "Currently in the lobby: \n" + playersString;
    // Ensure name change controls exist (only in lobby)
    createNameChangeControls();
    if (isHost) {
        createButton('info-section', 'startGame', 'Start Game', startGame);
    }
}
socket.on('game_ended', (playersString, isHost) => {
    location.reload();
    updateLobby(playersString, isHost);
});
socket.on('game_started', (gameStateString) => {
    const gameState = JSON.parse(gameStateString);
    gameID = gameState.gameID;
    players = gameState.players;
    savePlayerIdToCookie(socket.id);
    currentPlayer = players[gameState.current_player.id];
    currentNumPlayers = players.filter(p => p.lives > 0).length;
    doc.activateMainSection();
    createPlayerSections();
    doc.createPlayerTurnSection(doubt, claim, new Claim(0, 0));
    doc.hide();
    players.forEach((p) => { doc.updatePlayerSection(p); });
    updateUI(gameStateString);
});
function savePlayerIdToCookie(playerId) {
    localStorage.setItem("DICE_currentPlayerId", playerId);
    console.debug("Saved player ID to cookie:", playerId);
    const playerIdRead = localStorage.getItem("DICE_currentPlayerId");
    console.debug(playerIdRead);
}
// Function to retrieve a cookie
function getPlayerIdFromCookie() {
    console.debug("Getting player ID to cookie: PlayerId");
    const playerId = localStorage.getItem("DICE_currentPlayerId");
    console.debug(playerId);
    return playerId;
}
function createButton(parentId, buttonId, buttonText, onClickFunction) {
    const parentElement = document.getElementById(parentId);
    const button = document.createElement('button');
    button.id = buttonId;
    button.innerText = buttonText;
    button.onclick = onClickFunction;
    parentElement.appendChild(button);
}
export function startGame() {
    socket.emit('start_game');
}
export function backToLobby() {
    socket.emit('endGame', gameID);
}
window.onload = letsGo;
var currentPlayer;
var claimingPlayer;
var players = new Array();
var gameID = 0;
let currentNumPlayers;
let lossModeDice = false;
function letsGo() {
    doc.addDarkListener();
    //doc.createRulesSection();
    //doc.createGameChoices(startGame);
    document.getElementById('info-section').innerText = 'Waiting for players...';
}
// Creates a small input + button next to the info section to change player name while in lobby
function createNameChangeControls() {
    const parentElement = document.getElementById('info-section');
    if (!parentElement)
        return;
    // Avoid duplicating the controls on repeated lobby updates
    let container = document.getElementById('name-change-container');
    if (container)
        return;
    container = document.createElement('div');
    container.id = 'name-change-container';
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.marginTop = '8px';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'name-input';
    input.placeholder = 'Enter your name';
    const button = document.createElement('button');
    button.id = 'change-name-button';
    button.innerText = 'Change name';
    button.onclick = () => {
        var _a, _b;
        const value = (_b = (_a = document.getElementById('name-input')) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim();
        if (value) {
            socket.emit('change_name', value);
        }
    };
    container.appendChild(input);
    container.appendChild(button);
    parentElement.appendChild(container);
}
function updateUI(gameStateString) {
    const gameState = JSON.parse(gameStateString);
    console.log(gameState);
    players = gameState.players;
    currentPlayer = gameState.current_player;
    claimingPlayer = gameState.claiming_player;
    currentNumPlayers = players.filter(p => p.lives > 0).length;
    document.getElementById('info-section').innerText = gameState.statusMessages.join('\n');
    players.forEach((p) => {
        doc.updatePlayerSection(p);
        doc.setPlayerStatus(p, p.status);
    });
    if (currentNumPlayers <= 1) {
        doc.deactivatePlayerTurnSection();
        if (socket.id == currentPlayer.id) {
            createButton('info-section', 'startGame', 'Back to lobby', backToLobby);
        }
        // Remove the 'dead' class for all players
        players.forEach((player) => {
            const diceContainer = document.getElementById('dice-container' + players.indexOf(player));
            if (diceContainer) {
                diceContainer.classList.remove('dead');
            }
        });
    }
    else {
        console.log(currentPlayer, socket.id);
        if (currentPlayer.id == socket.id) {
            doc.appendInfoNewline('Your turn!');
            if (!claimingPlayer) {
                doc.activatePlayerTurnSection(new Claim(0, 0), claim, numActiveDice());
            }
            else {
                doc.activatePlayerTurnSection(claimingPlayer.claim, claim, numActiveDice());
            }
        }
        else {
            doc.deactivatePlayerTurnSection();
            doc.appendInfoNewline('Waiting for your turn...');
        }
    }
    if (gameState.revealDiceVal > 0) {
        doc.reveal(gameState.revealDiceVal);
        if (currentPlayer.id == socket.id && currentNumPlayers > 1) {
            document.getElementById('claim-button').innerText = 'Next Round!';
            doc.activatePlayerTurnSection(new Claim(0, 0), next_round, numActiveDice());
            document.getElementById('claim-button').setAttribute('disabled', 'false');
            doc.updateClaimButton(new Claim(0, 0));
        }
    }
    else {
        doc.hide();
        document.getElementById('claim-button').innerText = '❗ Claim ❗';
    }
}
function claim(claim) {
    // Send claim to server
    socket.emit('claim', JSON.stringify(claim));
}
function doubt() {
    // Send doubt to server
    socket.emit('doubt');
}
function next_round(claim) {
    // Send doubt to server
    socket.emit('next_round');
}
function startRoundMsg(p) {
    if (p.id == socket.id)
        return `You start the round.`;
    return `${p.name} starts the round.`;
}
function winnerMsg(winner) {
    if (winner.id == socket.id)
        return `You win!`;
    return `${winner.name} wins!`;
}
function totalNumDice() {
    return players.map(p => p.dice).flat().length;
}
function numActiveDice() {
    return players.filter(p => p.lives > 0).map(p => p.dice).flat().length;
}
function createPlayerSections() {
    players.forEach((p) => {
        doc.createPlayerSection(p, p.id == socket.id);
        doc.setPlayerStatus(p, Status.WAITING);
    });
}
export function getPlayerIdxByPlayer(player) {
    return players.indexOf(player);
}
//# sourceMappingURL=dice.js.map