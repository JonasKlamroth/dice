import * as util from './util.js';
export function npcClaim(currentClaim, ownDice, numOtherDice) {
    const rand = Math.random();
    // doubt if current claim is just too unlikely
    let prob = util.probOfClaim(currentClaim, ownDice, numOtherDice);
    if (prob < 0.5 && (rand - prob) > 0.5 || prob < 0.15) {
        return { count: 0, diceVal: 0 };
    }
    const freqs = getFreqs(ownDice);
    const maxFreq = Math.max(...freqs);
    const favs = freqs.reduce((indices, freq, index) => (freq === maxFreq ? [...indices, index] : indices), []);
    const fav = favs[Math.floor(Math.random() * favs.length)];
    const numOfFav = freqs[fav];
    let stillEarly = currentClaim.count <= numOtherDice / 5;
    let bluff = bluffClaim(fav, freqs, numOtherDice);
    let safe = safeClaim(currentClaim, numOtherDice, fav, numOfFav);
    if (stillEarly && rand > 0.5 && util.isGreater(bluff, currentClaim)) {
        return bluff;
    }
    else if (safe.count > 0 && safe.diceVal > 0) {
        return safe;
    }
    else {
        // no safe bet, so just go with the most likely
        const doubtRand = Math.random();
        if (currentClaim.count > 0 && doubtRand > prob) {
            return { count: 0, diceVal: 0 };
        }
        else {
            let _count = fav > currentClaim.diceVal ? currentClaim.count : currentClaim.count + 1;
            let claim = { count: _count, diceVal: fav };
            return claim;
        }
    }
}
function bluffClaim(fav, freqs, numOtherDice) {
    let bluffFav = Math.floor(Math.random() * 6) + 1;
    while (bluffFav === fav || bluffFav === 1) {
        bluffFav = Math.floor(Math.random() * 6) + 1;
    }
    let tmpBluffCount = Math.floor(freqs[fav] + numOtherDice / 3 - Math.ceil(Math.random() * 4));
    let bluffCount = Math.max(1, tmpBluffCount);
    return { count: bluffCount, diceVal: bluffFav };
}
function safeClaim(currentClaim, numOtherDice, diceVal, ownNumOf) {
    let expected = Math.floor(numOtherDice / 3) + ownNumOf;
    let safeClaim = { count: expected, diceVal: diceVal };
    if (util.isGreater(safeClaim, currentClaim)) {
        // pick number between current claim count and safeClaim count
        let claimCount = Math.ceil(Math.random() * (safeClaim.count - currentClaim.count)) + currentClaim.count;
        return { count: claimCount, diceVal: diceVal };
    }
    else {
        return { count: 0, diceVal: 0 };
    }
}
function getFreqs(ownDice) {
    const freqs = Array.from({ length: 7 }, (_, i) => ownDice.filter(num => num === i).length);
    for (let i = 2; i <= 6; i++) {
        freqs[i] += freqs[1];
    }
    freqs[1] = 0;
    return freqs;
}
//# sourceMappingURL=npc.js.map