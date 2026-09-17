"""Configuration for Packet Backend."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
DB_PATH = os.path.join(DATA_DIR, "places.db")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Flask
SECRET_KEY = os.environ.get("SECRET_KEY", "hao-qu-chu-secret-key-change-me")
HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 5678))

# OpenStreetMap Nominatim
NOMINATIM_USER_AGENT = "HaoQuChu/1.0 (Ronald iPhone App)"

# OpenRice search
OPENRICE_SEARCH_URL = "https://www.openrice.com/zh/hongkong/restaurants/search?where={}"