from telebot.handler_backends import State, StatesGroup


class states(StatesGroup):
    enter_group = State()
    enter_teacher = State()
