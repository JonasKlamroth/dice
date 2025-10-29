export function roll5dice() {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
}
export function rollNdice(n) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
}
export function isGreater(thisClaim, other) {
    return thisClaim.count > other.count || (thisClaim.count == other.count && thisClaim.diceVal > other.diceVal);
}
export function probOfClaim(claim, ownDice, numOtherDice) {
    let val = claim.diceVal;
    let own = ownDice.filter(d => d == val || d == 1).length;
    return probOfAtLeast(claim.count - own, numOtherDice);
}
// probability of at least k dice that show a number or 1 (in n dice)
export function probOfAtLeast(k, n) {
    let prob = 0;
    for (let i = k; i <= n; i++) {
        prob += binomial(n, i) * Math.pow(1 / 3, i) * Math.pow(2 / 3, n - i);
    }
    return prob;
}
export function binomial(n, k) {
    let coeff = 1;
    for (let x = n - k + 1; x <= n; x++)
        coeff *= x;
    for (let x = 1; x <= k; x++)
        coeff /= x;
    return coeff;
}
export function getDiceImgSrc(diceVal) {
    return 'static/img/dice' + diceVal + '.png';
}
export function totalNumDiceOf(diceVal, diceVals) {
    const dice = diceVals.flat();
    return dice.filter(d => d == diceVal || d == 1).length;
}
export function playerDieImgId(playerNum, dieNum) {
    return 'playerDieImg-' + playerNum + '-' + dieNum;
}
export function getDiceSymbol(num) {
    switch (num) {
        case 1: return '\u2680'; // Unicode for die face 1
        case 2: return '\u2681'; // Unicode for die face 2
        case 3: return '\u2682'; // Unicode for die face 3
        case 4: return '\u2683'; // Unicode for die face 4
        case 5: return '\u2684'; // Unicode for die face 5
        case 6: return '\u2685'; // Unicode for die face 6
        default: return ''; // Return an empty string for invalid input
    }
}
//# sourceMappingURL=util.js.map