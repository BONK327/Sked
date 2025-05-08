import os
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_URL = f"http://{os.getenv('IP_ADDRESS')}:{os.getenv('SERVER_PORT')}"


def post_user_data(user_id, user_firstname, user_username):
    payload = {
        "id": int(user_id),
        "firstname": user_firstname,
        "username": user_username
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/tgbot", json=payload)
        return response.json()['user']
    except requests.exceptions.RequestException as e:
        print("Ошибка запроса:", e)


def post_change_notifications(user_id):
    payload = {
        "id": int(user_id)
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/tgbot/notifications", json=payload)
        return response.json()['user']
    except requests.exceptions.RequestException as e:
        print("Ошибка запроса:", e)


def post_change_schedule(user_id, type, name):
    payload = {
        "id": int(user_id),
        "type": type,
        "name": name
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/users/tgbot/change", json=payload)
        return response.status_code, response.json()
    except requests.exceptions.RequestException as e:
        print("Ошибка запроса:", e)