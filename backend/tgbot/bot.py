import os
from dotenv import load_dotenv
from telebot import TeleBot, custom_filters
from telebot.storage import StateMemoryStorage

from tgbot.handlers import *

load_dotenv()


state_storage = StateMemoryStorage()
bot = TeleBot(os.getenv('TGBOT_TOKEN'), state_storage=state_storage, use_class_middlewares=True)
bot.add_custom_filter(custom_filters.StateFilter(bot))

register_handlers(bot)
