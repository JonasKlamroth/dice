import * as util from './util.js';
import { Status } from './types.js';
import { getPlayerIdxByPlayer } from './dice.js';
let listenersAlreadyAdded = false;
export function addDarkListener() {
    const darkToggle = document.getElementById('darkModeToggle');
    darkToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        this.classList.toggle('active');
    });
}
export function createElement(type, props, parent) {
    const element = document.createElement(type);
    Object.assign(element, props);
    parent.appendChild(element);
    return element;
}
export function createRulesSection() {
    const dialog = document.querySelector('.rules');
    const rulesButton = document.getElementById('rules-button');
    if (!dialog || !rulesButton)
        return;
    rulesButton.addEventListener('click', () => {
        dialog.showModal();
    });
    // Close the dialog when the Escape key is pressed
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dialog.close();
        }
    });
    // Close the dialog when a click occurs outside the dialog
    window.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}
export function appendInfoNewline(text) {
    appendInfo("<br>" + text);
}
export function appendInfo(text) {
    const infoSection = document.getElementById('info-section');
    if (infoSection) {
        infoSection.innerHTML += text;
        infoSection.scrollTop = infoSection.scrollHeight;
    }
}
export function clearInfo() {
    const infoSection = document.getElementById('info-section');
    if (infoSection) {
        infoSection.innerHTML = '';
    }
}
export function createPlayerSection(p, isMe) {
    let i = getPlayerIdxByPlayer(p);
    const container = isMe ?
        document.getElementById('player-container') :
        document.getElementById('npc-container');
    if (!container)
        return null;
    const playerSection = createElement('section', {
        id: `player${i}`,
        style: `--i: ${(i + 1.5).toString()}`,
        className: 'player-section'
    }, container);
    createElement('label', {
        textContent: p.name,
        className: 'player-label'
    }, playerSection);
    const imgContainer = createElement('container', {
        id: 'player-img-container-' + i,
        className: 'img-container'
    }, playerSection);
    createElement('img', {
        src: `static/img/${p.name}.png`,
        className: 'player-icon',
        width: 100
    }, imgContainer);
    const playerActivity = createElement('span', {
        className: 'player-activity',
        id: `player-activity${i}`,
        status: 'waiting'
    }, playerSection);
    createElement('label', {
        textContent: 'Waiting',
        className: 'player-status',
        id: `player-status${i}`
    }, playerActivity);
    const playerClaim = createElement('span', {
        className: 'player-claim',
        id: `player-claim${i}`
    }, playerActivity);
    createElement('span', {
        id: `player-claim-val${i}`
    }, playerClaim);
    createElement('img', {
        id: `player-claim-die${i}`
    }, playerClaim);
    createElement('div', {
        id: `dice-container${i}`,
        className: 'dice-container'
    }, playerSection);
    createElement('div', {
        className: 'lives-container',
        id: `lives-container${i}`
    }, playerSection);
    drawDice(p);
    return playerSection;
}
function drawDice(p) {
    const diceContainer = document.getElementById(`dice-container${getPlayerIdxByPlayer(p)}`);
    diceContainer.innerHTML = '';
    for (let j = 1; j <= p.dice.length; j++) {
        const imgContainer = createElement('img-container', {
            id: util.playerDieImgId(getPlayerIdxByPlayer(p), j) + '-container',
            className: 'player-die-img-container',
        }, diceContainer);
        createElement('img', {
            id: util.playerDieImgId(getPlayerIdxByPlayer(p), j),
            className: 'player-die-img',
            src: util.getDiceImgSrc(p.dice[j - 1]),
        }, imgContainer);
    }
}
export function drawLives(player) {
    const playerIdx = getPlayerIdxByPlayer(player);
    const livesContainer = document.getElementById('lives-container' + playerIdx);
    livesContainer.innerHTML = '';
    livesContainer.textContent = '❤️ '.repeat(player.lives);
}
export function updatePlayerSection(p) {
    const playerClaimVal = document.getElementById('player-claim-val' + getPlayerIdxByPlayer(p));
    const playerClaimDie = document.getElementById('player-claim-die' + getPlayerIdxByPlayer(p));
    if (p.claim.count > 0) {
        playerClaimVal.textContent = p.claim.count.toString();
        playerClaimDie.src = util.getDiceImgSrc(p.claim.diceVal);
    }
    drawDice(p);
    drawLives(p);
}
export function reveal(num) {
    document.body.setAttribute('revealed', 'true');
    const npcContainer = document.getElementById('npc-container');
    if (npcContainer) {
        npcContainer.setAttribute('revealed', 'true');
    }
    const imgList = document.querySelectorAll('.player-die-img');
    imgList.forEach((img) => {
        if (img.src.includes('dice1') || img.src.includes('dice' + num.toString())) {
            img.classList.add('highlighted-dice');
        }
    });
}
export function hide() {
    document.body.setAttribute('revealed', 'false');
    const npcContainer = document.getElementById('npc-container');
    if (npcContainer) {
        npcContainer.setAttribute('revealed', 'false');
    }
    const diceImgs = document.querySelectorAll('.player-die-img-container');
    diceImgs.forEach((cont) => {
        const img = cont.querySelector('img');
        if (img) {
            img.classList.remove('highlighted-dice');
        }
    });
}
export function deactivatePlayerTurnSection() {
    const playerTurnSection = document.getElementById('player-turn-section');
    if (!playerTurnSection)
        return;
    const interactiveElements = playerTurnSection.querySelectorAll('button, input, select, textarea');
    playerTurnSection.setAttribute('active', 'false');
    interactiveElements.forEach(element => {
        element.setAttribute('disabled', 'true');
    });
}
export function activatePlayerTurnSection(currentClaim, claim, currentNumDice) {
    const playerTurnSection = document.getElementById('player-turn-section');
    if (!playerTurnSection)
        return;
    const interactiveElements = playerTurnSection.querySelectorAll('button, input, select, textarea');
    playerTurnSection.setAttribute('active', 'true');
    interactiveElements.forEach(element => {
        element.removeAttribute('disabled');
    });
    if (currentClaim == null || currentClaim.count == 0) {
        const doubtSection = document.getElementById('doubt-section');
        const doubtButton = doubtSection ? doubtSection.querySelector('button') : null;
        if (doubtButton) {
            doubtButton.setAttribute('disabled', 'true');
        }
    }
    const slider = document.getElementById('claim-slider');
    const minVal = Math.max(currentClaim.count, 1);
    slider.min = minVal.toString();
    slider.max = currentNumDice.toString();
    slider.value = minVal.toString();
    const label = document.getElementById('claim-slider-label');
    if (label) {
        label.textContent = slider.value;
    }
    const doubtSection = document.getElementById('doubt-section');
    const doubtButton = doubtSection ? doubtSection.querySelector('button') : null;
    if (doubtButton) {
        doubtButton.disabled = currentClaim.count == 0;
        updateClaimEventListeners(claim, currentClaim);
        updateClaimButton(currentClaim);
    }
}
export function createGameChoices(startGame) {
    appendInfo('Choose game options! :)');
    const optionsPanel = createElement('div', { id: 'options-panel' }, document.body);
    createNumPlayerChoice(optionsPanel);
    createGameSpeedChoice(optionsPanel);
    createLossModeChoice(optionsPanel);
    const startButton = createElement('button', {
        id: 'setup-game',
        textContent: 'Start Game',
        eventListeners: { click: startGame },
    }, optionsPanel);
    startButton.addEventListener('click', startGame);
}
function createNumPlayerChoice(optionsPanel) {
    const numPlayersForm = createElement('div', { id: 'num-players-form', textContent: 'Number of players:' }, optionsPanel);
    for (let i = 2; i <= 8; i++) {
        const radio = createElement('input', {
            type: 'radio',
            value: i.toString(),
            name: 'num-players',
            id: 'num-players' + i,
            checked: i === 8,
        }, numPlayersForm);
        const label = createElement('label', { textContent: `${i}` }, radio);
        label.setAttribute('for', 'num-players' + i);
        numPlayersForm.appendChild(radio);
        numPlayersForm.appendChild(label);
    }
}
function createGameSpeedChoice(optionsPanel) {
    const gameSpeedForm = createElement('div', { id: 'game-speed-form', textContent: 'Game speed:' }, optionsPanel);
    const speeds = ['Fast', 'Medium', 'Slow'];
    for (let i = 0; i < speeds.length; i++) {
        const radio = createElement('input', {
            type: 'radio',
            value: i + 1,
            name: 'game-speed',
            id: 'game-speed' + speeds[i],
            checked: i === 0,
        }, gameSpeedForm);
        const label = createElement('label', { textContent: speeds[i] }, gameSpeedForm);
        label.setAttribute('for', 'game-speed' + speeds[i]);
        gameSpeedForm.appendChild(radio);
        gameSpeedForm.appendChild(label);
    }
}
function createLossModeChoice(optionsPanel) {
    const lossModeForm = createElement('div', { id: 'loss-mode-form', textContent: 'Loss mode:' }, optionsPanel);
    const lossModes = ['Lives', 'Dice'];
    for (let i = 0; i < lossModes.length; i++) {
        const radio = createElement('input', {
            type: 'radio',
            value: lossModes[i],
            name: 'loss-mode',
            id: 'loss-mode' + lossModes[i],
            checked: i === 1,
        }, lossModeForm);
        const label = createElement('label', { textContent: lossModes[i] }, lossModeForm);
        label.setAttribute('for', 'loss-mode' + lossModes[i]);
        lossModeForm.appendChild(radio);
        lossModeForm.appendChild(label);
    }
}
export function activateMainSection() {
    //document.getElementById('options-panel').remove();
    const playerContainer = document.getElementById('player-container');
    if (playerContainer) {
        playerContainer.style.display = 'grid';
    }
    const infoSection = document.getElementById('info-section');
    if (infoSection) {
        infoSection.style.display = 'block';
    }
}
export function activateNewGameButton() {
    const infoSection = document.getElementById('info-section');
    if (!infoSection)
        return;
    const newGameButton = createElement('button', {
        id: 'new-game-button',
        textContent: 'New Game'
    }, infoSection);
    newGameButton.addEventListener('click', restartGame);
}
function restartGame() {
    const playerContainer = document.getElementById('player-container');
    if (playerContainer) {
        playerContainer.innerHTML = '';
    }
    const playerTurnSection = document.getElementById('player-turn-section');
    if (playerTurnSection) {
        playerTurnSection.innerHTML = '';
    }
    const npcContainer = document.getElementById('npc-container');
    if (npcContainer) {
        npcContainer.innerHTML = '';
    }
    const infoSection = document.getElementById('info-section');
    if (infoSection) {
        infoSection.innerHTML = '';
    }
    //createGameChoices(startGame);
}
export function setPlayerStatus(player, status) {
    const playerId = getPlayerIdxByPlayer(player);
    status = player.status;
    const activity = document.getElementById('player-activity' + playerId);
    if (activity) {
        activity.setAttribute('status', status.toLowerCase().replace('!', ''));
    }
    const statusLabel = document.getElementById('player-status' + playerId);
    if (statusLabel) {
        let txt;
        switch (status) {
            case Status.WAITING:
                txt = "😴";
                break;
            case Status.CLAIM:
                txt = "❗";
                break;
            case Status.THINKING:
                txt = "🤔";
                break;
            case Status.DOUBT:
                txt = "🧐";
                break;
            case Status.OOPS:
                txt = getLosingEmoji();
                break;
            case Status.HEH:
                txt = getWinningEmoji();
                break;
            case Status.DEAD:
                txt = "🪦";
                const diceContainer = document.getElementById('dice-container' + playerId);
                if (diceContainer) {
                    diceContainer.classList.add('dead');
                }
                break;
            case Status.WINNER:
                txt = "🎉✌️🥳";
                break;
        }
        ;
        statusLabel.textContent = txt;
    }
}
function getWinningEmoji() {
    const a = ["😏", "😎", "😤", "🤙"];
    return a[Math.floor(Math.random() * a.length)];
}
function getLosingEmoji() {
    const a = ["😵", "😱", "🥺", "😖"];
    return a[Math.floor(Math.random() * a.length)];
}
export function updateClaimEventListeners(claim, currentClaim) {
    const claimButton = document.getElementById('claim-button');
    if (!claimButton)
        return;
    claimButton.addEventListener('click', () => {
        const slider = document.getElementById('claim-slider');
        const claimCount = parseInt(slider.value);
        const claimValue = getClaimDiceVal();
        claim({ count: claimCount, diceVal: claimValue });
    });
}
export function createPlayerTurnSection(doubt, claim, currentClaim) {
    const playerTurnSection = document.getElementById('player-turn-section');
    if (!playerTurnSection)
        return;
    playerTurnSection.innerHTML = '';
    const doubtSection = createElement('section', {
        id: 'doubt-section',
        className: 'doubt-section'
    }, playerTurnSection);
    const doubtButton = createElement('button', {
        textContent: '🧐 Doubt! 🧐',
        disabled: true
    }, doubtSection);
    doubtButton.addEventListener('click', doubt);
    const claimSection = createElement('section', {
        id: 'claim-section',
        className: 'claim-section'
    }, playerTurnSection);
    const sliderDiv = createElement('div', {
        className: 'slider-div'
    }, claimSection);
    createElement('button', {
        id: 'slider-down-button',
        textContent: '↓'
    }, sliderDiv);
    createElement('input', {
        type: 'range',
        id: 'claim-slider',
        className: 'slider'
    }, sliderDiv);
    createElement('label', {
        id: 'claim-slider-label'
    }, sliderDiv);
    createElement('button', {
        id: 'slider-up-button',
        textContent: '↑'
    }, sliderDiv);
    const claimDice = document.createElement('div');
    claimDice.className = 'claim-dice';
    for (let i = 2; i <= 6; ++i) {
        const rButtLabel = document.createElement('label');
        const rButt = createElement('input', {
            type: 'radio',
            value: i.toString(),
            name: 'dice-val-claim'
        }, rButtLabel);
        if (i == 2) {
            rButt.checked = true;
        }
        createElement('img', {
            src: util.getDiceImgSrc(i)
        }, rButtLabel);
        claimDice.appendChild(rButtLabel);
        rButt.addEventListener('change', () => {
            updateClaimButton(currentClaim);
        });
    }
    claimSection.appendChild(claimDice);
    createElement('button', {
        id: 'claim-button',
        textContent: '❗ Claim ❗',
        disabled: true
    }, claimSection);
    addEvListeners();
    playerTurnSection.appendChild(claimSection);
    playerTurnSection.style.display = 'grid';
}
export function updateClaimButton(currentClaim) {
    const slider = document.getElementById('claim-slider');
    const claimCount = parseInt(slider.value);
    const claimValue = getClaimDiceVal();
    const claimButton = document.getElementById('claim-button');
    const pts = document.getElementById('player-turn-section');
    claimButton.disabled =
        !util.isGreater({ count: claimCount, diceVal: claimValue }, currentClaim)
            || (pts ? pts.getAttribute('active') === 'false' : false);
    claimButton.focus();
}
export function addEvListeners() {
    if (listenersAlreadyAdded)
        return;
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            const doubtSection = document.getElementById('doubt-section');
            const doubtButton = doubtSection ? doubtSection.querySelector('button') : null;
            if (doubtButton && !doubtButton.disabled) {
                doubtButton.click();
                deactivatePlayerTurnSection();
            }
        }
        if (event.key === 'Enter') {
            const claimButton = document.getElementById('claim-button');
            if (claimButton && !claimButton.disabled) {
                claimButton.click();
                deactivatePlayerTurnSection();
            }
        }
        if (event.key === 'ArrowUp') {
            sliderUp();
        }
        else if (event.key === 'ArrowDown') {
            sliderDown();
        }
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            changeRadioSel(event.key);
        }
    });
    const sliderUpButton = document.getElementById('slider-up-button');
    const sliderDownButton = document.getElementById('slider-down-button');
    if (sliderUpButton) {
        sliderUpButton.addEventListener('click', sliderUp);
    }
    if (sliderDownButton) {
        sliderDownButton.addEventListener('click', sliderDown);
    }
    listenersAlreadyAdded = true;
}
function sliderUp() {
    const slider = document.getElementById('claim-slider');
    const sliderValue = parseInt(slider.value);
    if (sliderValue < parseInt(slider.max)) {
        slider.value = (sliderValue + 1).toString();
        // Trigger the input event manually to update the button state and label
        slider.dispatchEvent(new Event('input'));
    }
}
function sliderDown() {
    const slider = document.getElementById('claim-slider');
    const sliderValue = parseInt(slider.value);
    if (sliderValue > parseInt(slider.min)) {
        slider.value = (sliderValue - 1).toString();
        // Trigger the input event manually to update the button state and label
        slider.dispatchEvent(new Event('input'));
    }
}
function changeRadioSel(key) {
    const radioButtons = Array.from(document.querySelectorAll('input[type="radio"]'));
    const selectedRadioButton = radioButtons.find(radio => radio.checked);
    if (selectedRadioButton) {
        const selectedIndex = radioButtons.indexOf(selectedRadioButton);
        if (key === 'ArrowLeft' && selectedIndex > 0) {
            const previousRadioButton = radioButtons[selectedIndex - 1];
            previousRadioButton.checked = true;
        }
        else if (key === 'ArrowRight' && selectedIndex < radioButtons.length - 1) {
            const nextRadioButton = radioButtons[selectedIndex + 1];
            nextRadioButton.checked = true;
        }
        // Trigger change event manually to update the button state
        selectedRadioButton.dispatchEvent(new Event('change'));
    }
}
function getClaimDiceVal() {
    const rButt = document.querySelector('input[name="dice-val-claim"]:checked');
    if (!rButt)
        return 0;
    return parseInt(rButt.value);
}
//# sourceMappingURL=docInteraction.js.map