from telebot.types import CallbackQuery


def notice_filter(callback: CallbackQuery) -> bool:
    first_word = callback.data.split('_')[0]
    return first_word == "notice"

def choice_type_filter(callback: CallbackQuery) -> bool:
    return callback.data == "change_schedule"

def enter_group_filter(callback: CallbackQuery) -> bool:
    return  callback.data == "student"

def enter_teacher_filter(callback: CallbackQuery) -> bool:
    return  callback.data == "teacher"

def cancel_filter(callback: CallbackQuery) -> bool:
    return  callback.data == "cancel"
