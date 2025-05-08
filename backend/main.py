from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from tgbot.bot import bot
import threading

load_dotenv()

app = Flask(__name__)

@app.route('/tgbot', methods=['POST'])
def handle_webhook():
    try:
        data = request.json
        print(data)
        if not data or not isinstance(data, list):
            return jsonify({"status": "error", "message": "Требуется JSON-массив пользователей"}), 400
        for user in data:
            user_id = user['id']
            firstname = user['firstname']
            if not user_id:
                continue
            try:
                bot.send_message(
                    chat_id=user_id,
                    text=f"{firstname}, ваше расписание изменилось"
                )
            except Exception as e:
                print(f"Ошибка при отправке для {user_id}: {e}")
        return jsonify({"status": "success", "users_processed": len(data)}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    # Запускаем Flask в отдельном потоке
    flask_thread = threading.Thread(
        target=app.run,
        kwargs={'host': '0.0.0.0', 'port': int(os.getenv('TGBOT_PORT', 3030)), 'debug': False, 'use_reloader': False}
    )
    flask_thread.start()
    
    # Запускаем бота в основном потоке
    print("Бот запущен...")
    bot.infinity_polling()
