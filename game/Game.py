import logging
import random 
import numpy as np
import json
import random
from game.Claim import Claim
from game.Player import Player, Status


class StatusMessageHandler(logging.Handler):
    def __init__(self, game, maxLogEntries=9):
        super().__init__()
        self.game = game
        self.maxLogEntries = maxLogEntries

    def emit(self, record):
        log_entry = self.format(record)
        self.game.statusMessages.append(log_entry)
        if len(self.game.statusMessages) > self.maxLogEntries:
            self.game.statusMessages.pop(-1)

class Game:
    players = []
    currentClaim = Claim(0, 0)
    current_player = None
    claiming_player = None
    statusMessages = []
    id = 0
    revealDiceVal = 0

    def __init__(self, players :list[Player]):
        self.players = players
        self.current_player = players[0]
        self.claiming_player = None
        self.statusMessages = []
        self.logger = logging.getLogger(f"Game-{self.id}")
        self.logger.debug(f"Game initialized with players: {[p.name for p in players]}")
        statusMessageHandler = StatusMessageHandler(self)
        statusMessageHandler.setLevel(logging.INFO)
        self.logger.addHandler(statusMessageHandler)
    
    def restart(self):
        self.statusMessages = []
        for p in self.players:
            p.lives = 5
            p.dice = []
            p.claim = None
            p.status = Status.WAITING
        self.current_player = self.players[0]
        self.claiming_player = None
        revealDiceVal = 0

    def to_dict(self):
        return {
            'gameID': self.id,
            'players': [p.to_dict() for p in self.players],
            'currentClaim': self.currentClaim.to_dict() if self.currentClaim else None,
            'current_player': self.current_player.to_dict(),
            'claiming_player': self.claiming_player.to_dict() if self.claiming_player else None,
            'statusMessages': self.statusMessages,
            'id': self.id,
            'revealDiceVal': self.revealDiceVal
        }

    def toJSON(self):
        return json.dumps(self.to_dict(), sort_keys=True, indent=4)

    def claim(self, claim):
        self.logger.info(f"{self.current_player.name} claims {claim.count} x {claim.diceVal}'s")
        self.claiming_player = self.current_player
        self.current_player = self.next_player()
        self.reset_all_players_status()
        self.claiming_player.status = Status.CLAIM
        self.claiming_player.claim = claim


    def reset_all_players_status(self):
        for p in self.players:
            if p.lives > 0:
                p.status = Status.WAITING
            else:
                p.status = Status.DEAD
        self.current_player.status = Status.THINKING

    def doubt(self):
        self.reset_all_players_status()
        self.logger.info(f"{self.current_player.name} doubts {self.claiming_player.name}'s claim of {self.current_claim().count} x {self.current_claim().diceVal}'s")
        tot = self.total_num_dice_of(self.claiming_player.claim.diceVal, self.diceVals())
        self.logger.debug(f"Total dice of value {self.claiming_player.claim.diceVal}: {tot}")
        self.revealDiceVal = self.claiming_player.claim.diceVal
        if tot < self.current_claim().count:
            # Doubt justified
            self.claiming_player.status = Status.OOPS
            self.current_player.status = Status.DOUBT
            self.logger.info(f"Doubt justified! {self.claiming_player.name} loses a life.")
            self.subtract_life(self.claiming_player, self.current_claim().count - tot)
            self.current_player = self.claiming_player
        else:
            # Doubt unjustified
            self.claiming_player.status = Status.HEH
            self.current_player.status = Status.OOPS
            self.logger.info(f"Doubt unjustified! {self.current_player.name} loses a life.")
            self.subtract_life(self.current_player, tot - self.current_claim().count)

    def subtract_life(self, p, diff):
        old_lives = p.lives
        p.lives -= 1
        if p.lives == 0:
            p.status = Status.DEAD
            self.logger.info(f"{p.name} is eliminated!")
            if sum(1 for pl in self.players if pl.lives > 0) == 1:
                winner = next(pl for pl in self.players if pl.lives > 0)
                winner.status = Status.WINNER
                self.logger.info(f"{winner.name} is the winner!")

    def start_new_round(self):
        self.logger.info("Starting new round.")
        for p in self.players:
            if p.lives > 0:
                p.dice = [random.randint(1, 6) for _ in range(5)]
                self.logger.debug(f"{p.name} rolls: {p.dice}")
        self.reset_claims()
        self.claiming_player = None
        self.revealDiceVal = 0
        self.reset_all_players_status()

    def start_game(self):
        self.current_player = self.players[random.randint(0, len(self.players) - 1)]
        self.logger.info(f"Game started. First player: {self.current_player.name}")
        self.start_new_round()
        self.current_player.status = Status.THINKING

    def ai_take_turn(self):
        self.logger.debug(f"AI player {self.current_player.name} is taking its turn.")
        diceVal = self.current_claim.diceVal
        expectedCountBase = (len(self.players) - 1) * 5 // 3 
        expectedCount = expectedCountBase + sum(1 for d in self.current_player.dice if d == diceVal or d == 1)
        random_number = random.choice([-1, 0, 1])
        if self.current_claim.count > expectedCount + random_number:
            #realistic claim 
            pass
        else:
            self.doubt()

    def reset_claims(self):
        self.logger.debug("Resetting claims for all players.")
        for p in self.players:
            p.claim = Claim(0, 0)

    def current_claim(self):
        return self.claiming_player.claim

    def next_player(self):
        cur_id = (self.players.index(self.current_player) + 1) % len(self.players)
        while self.players[cur_id].lives <= 0:
            cur_id = (cur_id + 1) % len(self.players)
        return self.players[cur_id]

    def diceVals(self):
        return [x for p in self.players for x in p.dice]

    def total_num_dice(self):
        return sum(len(p.dice) for p in self.players)

    def get_num_other_dice(self, p):
        return sum(len(pl.dice) for pl in self.players if pl.id != p.id and pl.lives > 0)

    def total_num_dice_of(self, val, diceVals):
        self.logger.debug(f"Counting dice of value {val} (including wilds) for {diceVals}")
        return sum(1 for d in diceVals if d == val or d == 1)