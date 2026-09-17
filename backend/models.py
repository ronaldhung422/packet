"""Database models and setup for 好去處."""
import sqlite3
import os
from datetime import datetime
from config import DB_PATH


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initialize the database schema."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            icon TEXT DEFAULT '📍',
            color TEXT DEFAULT '#4472C4',
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            source_url TEXT,
            source TEXT DEFAULT 'manual',
            address TEXT,
            lat REAL,
            lng REAL,
            phone TEXT,
            openrice_url TEXT,
            website TEXT,
            category_id INTEGER,
            rating INTEGER DEFAULT 0,
            notes TEXT,
            created_by TEXT DEFAULT 'Ronald',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id);
        CREATE INDEX IF NOT EXISTS idx_memories_place ON memories(place_id);
    """)

    # Insert default categories if empty
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        default_cats = [
            ("🍜 拉麵", "🍜", "#E74C3C", 1),
            ("🍣 日本菜", "🍣", "#E67E22", 2),
            ("🥩 扒房/西餐", "🥩", "#8E44AD", 3),
            ("☕ Cafe", "☕", "#795548", 4),
            ("🍜 粉麵", "🍜", "#F39C12", 5),
            ("🥟 點心/中式", "🥟", "#C0392B", 6),
            ("🌮 異國菜", "🌮", "#2ECC71", 7),
            ("🍰 甜品", "🍰", "#E91E63", 8),
            ("🎯 好去處/景點", "🎯", "#2196F3", 9),
            ("📸 打卡位", "📸", "#9C27B0", 10),
        ]
        cursor.executemany(
            "INSERT INTO categories (name, icon, color, sort_order) VALUES (?, ?, ?, ?)",
            default_cats,
        )

    conn.commit()
    conn.close()


def place_to_dict(row):
    """Convert a place row to a dictionary."""
    return dict(row)


def row_to_dict(row):
    return dict(row)