from .Claim import Claim

class Status:
    WAITING = 'Waiting'
    THINKING = 'Thinking'
    CLAIM = 'Claim'
    DOUBT = 'Doubt'
    OOPS = 'Oops'
    HEH = 'Heh'
    DEAD = 'Dead'
    WINNER = 'Winner'

class Player:
    names = ['Stag', 'Fishy', 'Meow', 'Runner', 'Butterfly', 'Tank', 'Klaus']

    def __init__(self, id, name="", dice=None, lives=2, claim=None, status=Status.WAITING):
        self.id = id
        self.name = name
        self.dice = dice if dice is not None else []
        self.lives = lives
        self.claim = claim if claim is not None else Claim()
        self.status = status

    def to_dict(self):
        return {
            'name': self.name,
            'dice': self.dice,
            'lives': self.lives,
            'claim': self.claim.to_dict(),
            'status': self.status,
            'id': self.id
        }