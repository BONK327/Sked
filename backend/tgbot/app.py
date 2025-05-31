from flask import Flask, request, jsonify
import time
from bot import bot


app = Flask(__name__)


@app.route('/tgbot', methods=['POST'])
def handle_webhook():
    try:
        data = request.json
        if not data or not isinstance(data, list):
            return jsonify({"status": "error", "message": "Требуется JSON-массив пользователей"}), 400
        counter = 0
        for user in data:
            if counter % 40 == 0:
                time.sleep(3)
            user_id = user['id']
            firstname = user['firstname']
            if not user_id:
                continue
            try:
                bot.send_message(
                    chat_id=user_id,
                    text=f"{firstname}, Ваше расписание изменилось"
                )
                counter += 1
            except Exception as e:
                print(f"Ошибка при отправке для {user_id}: {e}")
        return jsonify({"status": "success", "users_processed": len(data)}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3030)