from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
from telebot.util import quick_markup


def main_menu_keyboard(flag:bool = True):
    if flag:
        keyboard = quick_markup({
            "Выключить уведомления": {"callback_data": "notice_off"},
            "Выбрать отслеживаемое расписание": {"callback_data": "change_schedule"}
        }, row_width=1)
    else:
        keyboard = quick_markup({
            "Включить уведомления": {"callback_data": "notice_off"},
            "Выбрать отслеживаемое расписание": {"callback_data": "change_schedule"}
        }, row_width=1)
    return keyboard


def choice_type_keyboard():
    keyboard = quick_markup({
        "Я студент": {"callback_data": "student"},
        "Я преподаватель": {"callback_data": "teacher"}
    }, row_width=2)
    return keyboard


def cancel_keyboard():
    keyboard = quick_markup({
        "Назад": {"callback_data": "cancel"}
    }, row_width=1)
    return keyboard