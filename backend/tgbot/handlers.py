from telebot import TeleBot
from telebot.types import Message


from tgbot.keyboards import main_menu_keyboard, choice_type_keyboard, cancel_keyboard
from tgbot.filters import *
from tgbot.states import states
from tgbot.queries import *




def register_handlers(bot: TeleBot):

    @bot.message_handler(commands=['start'], chat_types=['private'])
    def start_command_handler(message: Message):
        user_id = message.from_user.id
        bot.delete_state(user_id, user_id)
        user_firstname = message.from_user.first_name
        user_username = message.from_user.username
        user = post_user_data(user_id, user_firstname, user_username)
        bot.send_message(user_id, f"{user_firstname}, приветствую!\nЯ бот КубГАУ, который отображает расписание и сообщает об его изменении.",
                         reply_markup=main_menu_keyboard(user['notifications']))


    @bot.callback_query_handler(func=lambda callback: notice_filter(callback))
    def notice_callback_handler(callback: CallbackQuery):
        user_id = callback.from_user.id
        bot.delete_state(user_id, user_id)
        user_firstname = callback.from_user.first_name
        user = post_change_notifications(user_id)
        bot.answer_callback_query(callback.id, f"Уведомления {'включены' if user['notifications'] else 'выключены'}")
        bot.edit_message_text(f"{user_firstname}, приветствую!\nЯ бот КубГАУ, который oтображает расписание и сообщает об его изменении.",
                              user_id, callback.message.id, reply_markup=main_menu_keyboard(user['notifications']))
        
    
    @bot.callback_query_handler(func=lambda callback: cancel_filter(callback))
    def notice_callback_handler(callback: CallbackQuery):
        user_id = callback.from_user.id
        user_firstname = callback.from_user.first_name
        user_username = callback.from_user.username
        bot.delete_state(user_id, user_id)
        user = post_user_data(user_id, user_firstname, user_username)
        bot.edit_message_text(f"{user_firstname}, приветствую!\nЯ бот КубГАУ, который oтображает расписание и сообщает об его изменении.",
                              user_id, callback.message.id, reply_markup=main_menu_keyboard(user['notifications']))


    @bot.callback_query_handler(func=lambda callback: choice_type_filter(callback))
    def choice_type_callback_handler(callback: CallbackQuery):
        user_id = callback.from_user.id
        bot.edit_message_text("Выберете роль", user_id, callback.message.id,
                              reply_markup=choice_type_keyboard())
    

    @bot.callback_query_handler(func=lambda callback: enter_group_filter(callback))
    def student_callback_handler(callback: CallbackQuery):
        user_id = callback.from_user.id
        bot.edit_message_text("Отправьте название Вашей группы", user_id, callback.message.id,
                              reply_markup=cancel_keyboard())
        bot.set_state(user_id, states.enter_group, user_id)
    

    @bot.callback_query_handler(func=lambda callback: enter_teacher_filter(callback))
    def teacher_callback_handler(callback: CallbackQuery):
        user_id = callback.from_user.id
        bot.edit_message_text("Отправьте Вашу фамилию с инициалами", user_id, callback.message.id,
                              reply_markup=cancel_keyboard())
        bot.set_state(user_id, states.enter_teacher, user_id)

    
    @bot.message_handler(state=states.enter_group, chat_types=['private'])
    def enter_group_handler(message: Message):
        user_id = message.from_user.id
        group_name = message.text
        data = post_change_schedule(user_id, 'group', group_name)
        if (data[0] == 404):
            bot.send_message(user_id, "Такой группы не существует",
                             reply_markup=cancel_keyboard())
        else:
            bot.send_message(user_id, "Расписание успешно изменилось",
                             reply_markup=cancel_keyboard())
            bot.delete_state(user_id, user_id)


    @bot.message_handler(state=states.enter_teacher, chat_types=['private'])
    def enter_teacher_handler(message: Message):
        user_id = message.from_user.id
        teacher_name = message.text
        data = post_change_schedule(user_id, 'teacher', teacher_name)
        if (data[0] == 404):
            bot.send_message(user_id, "Такого преподавателя не существует",
                             reply_markup=cancel_keyboard())
        else:
            bot.send_message(user_id, "Расписание успешно изменилось",
                             reply_markup=cancel_keyboard())
            bot.delete_state(user_id, user_id)