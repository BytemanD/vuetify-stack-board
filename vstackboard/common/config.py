from dataclasses import dataclass
from dataclasses import field

from easy2use.common import exceptions


class ValueNotInChoices(exceptions.BaseException):
    _msg = 'Invalid value {value}, which not in {choices}.'


@dataclass
class Option:
    name: str
    default: str = None
    choices: list = field(default_factory=[])


@dataclass
class Item(object):
    name: str
    default: str = None
    description: str = None
    choices: list = field(default_factory=list)
    value = None
    type = str

    def __post_init__(self):
        if self.choices and self.default and self.default not in self.choices:
            raise ValueNotInChoices(value=self.default, choices=self.choices)
        self.default = self.type(self.default)
        self.value = self.default

    def set(self, value):
        if self.choices and (value not in self.choices):
            raise ValueNotInChoices(value=self.value, choices=self.choices)
        self.value = self.type(value)

    def reset(self):
        self.value = self.default


class IntItem(Item):
    type = int


class BoolItem(Item):
    type = bool
