"""Database abstraction: SQLite (local) or PostgreSQL (production).
Auto-detects from DATABASE_URL environment variable."""
import os
import sqlite3
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL", "")
DB_PATH = os.environ.get("DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "places.db"))

_use_postgres = bool(DATABASE_URL)
_conn = None


def get_conn():
    global _conn
    if _use_postgres:
        if _conn is None or _conn.closed:
            import psycopg2
            _conn = psycopg2.connect(DATABASE_URL)
        return _conn
    else:
        if _conn is None:
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            _conn = sqlite3.connect(DB_PATH)
            _conn.row_factory = sqlite3.Row
            _conn.execute("PRAGMA foreign_keys = ON")
        return _conn


def close_conn():
    global _conn
    if _conn:
        _conn.close()
        _conn = None


def execute(sql, params=None):
    conn = get_conn()
    if isinstance(params, dict):
        if _use_postgres:
            sql = sql.replace("?", "%s")
        cur = conn.cursor()
        cur.execute(sql, params or {})
    else:
        cur = conn.cursor()
        if _use_postgres:
            sql = sql.replace("?", "%s")
        cur.execute(sql, params or [])
    conn.commit()
    return cur


def fetchall(sql, params=None):
    return execute(sql, params).fetchall()


def fetchone(sql, params=None):
    return execute(sql, params).fetchone()


def dicts_from_rows(rows):
    if _use_postgres:
        import psycopg2.extras
        return [dict(r) for r in rows]
    return [dict(r) for r in rows]


def init_db():
    """Create tables if they don't exist."""
    if _use_postgres:
        _init_postgres()
    else:
        _init_sqlite()


def _init_sqlite():
    execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            icon TEXT DEFAULT '📍',
            color TEXT DEFAULT '#4472C4',
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute("""
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
        )
    """)
    execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
        )
    """)
    execute("CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id)")
    execute("CREATE INDEX IF NOT EXISTS idx_memories_place ON memories(place_id)")
    _seed_categories()


def _init_postgres():
    execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            icon TEXT DEFAULT '📍',
            color TEXT DEFAULT '#4472C4',
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute("""
        CREATE TABLE IF NOT EXISTS places (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            source_url TEXT,
            source TEXT DEFAULT 'manual',
            address TEXT,
            lat DOUBLE PRECISION,
            lng DOUBLE PRECISION,
            phone TEXT,
            openrice_url TEXT,
            website TEXT,
            category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            rating INTEGER DEFAULT 0,
            notes TEXT,
            created_by TEXT DEFAULT 'Ronald',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute("""
        CREATE TABLE IF NOT EXISTS memories (
            id SERIAL PRIMARY KEY,
            place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    execute("CREATE INDEX IF NOT EXISTS idx_places_category ON places(category_id)")
    execute("CREATE INDEX IF NOT EXISTS idx_memories_place ON memories(place_id)")
    _seed_categories()


def _seed_categories():
    rows = fetchall("SELECT COUNT(*) as cnt FROM categories")
    count = dicts_from_rows(rows)[0]["cnt"]
    if count > 0:
        return

    defaults = [
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
    for name, icon, color, order in defaults:
        try:
            execute(
                "INSERT INTO categories (name, icon, color, sort_order) VALUES (?, ?, ?, ?)",
                [name, icon, color, order],
            )
        except Exception:
            pass