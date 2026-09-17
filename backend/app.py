"""Packet Backend — Flask API for saving restaurants & places from IG/Threads."""
import json
import os
import sys
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import HOST, PORT
import db
from scraper import parse_ig_url, detect_source
from geocoder import search_place, reverse_geocode
from openrice import search_openrice

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# ───────────────────────────────
# Initialize database on startup
# ───────────────────────────────
db.init_db()


# ══════════════════════════════════
#  FRONTEND — Serve PWA
# ══════════════════════════════════

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)


# ══════════════════════════════════
#  HELPERS
# ══════════════════════════════════

def places_list(params=None):
    """Fetch places with optional filters, return list of dicts."""
    sql = """
        SELECT p.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    vals = []
    if params:
        if params.get("category_id"):
            sql += " AND p.category_id = ?"
            vals.append(int(params["category_id"]))
        if params.get("search"):
            s = f"%{params['search']}%"
            sql += " AND (p.name LIKE ? OR p.notes LIKE ? OR p.address LIKE ?)"
            vals.extend([s, s, s])
    sql += " ORDER BY p.created_at DESC"
    rows = db.fetchall(sql, vals)
    return db.dicts_from_rows(rows)


def place_by_id(place_id):
    """Get a single place by ID."""
    row = db.fetchone("""
        SELECT p.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    """, [place_id])
    return dict(row) if row else None


def memories_for_place(place_id):
    rows = db.fetchall(
        "SELECT * FROM memories WHERE place_id = ? ORDER BY created_at DESC",
        [place_id],
    )
    return db.dicts_from_rows(rows)


# ══════════════════════════════════
#  API: PARSE LINK
# ══════════════════════════════════

@app.route("/api/parse", methods=["POST"])
def api_parse():
    """Parse an Instagram/Threads link and return extracted info."""
    data = request.get_json(force=True)
    url = (data.get("url", "") or "").strip()
    if not url:
        return jsonify({"error": "請提供 URL 連結"}), 400

    source = detect_source(url)
    if not source:
        return jsonify({
            "source": "unknown",
            "suggested_name": "",
            "description": "",
            "message": "無法識別呢條 link，請手動輸入餐廳名",
        })

    result = parse_ig_url(url)
    return jsonify(result)


# ══════════════════════════════════
#  API: GEOCODE
# ══════════════════════════════════

@app.route("/api/geocode", methods=["POST"])
def api_geocode():
    data = request.get_json(force=True)
    query = (data.get("query", "") or "").strip()
    if not query:
        return jsonify({"error": "請輸入搜尋字串"}), 400
    results = search_place(query)
    return jsonify({"results": results})


@app.route("/api/reverse-geocode", methods=["POST"])
def api_reverse_geocode():
    data = request.get_json(force=True)
    lat, lng = data.get("lat"), data.get("lng")
    if lat is None or lng is None:
        return jsonify({"error": "請提供 lat 和 lng"}), 400
    result = reverse_geocode(float(lat), float(lng))
    return jsonify(result)


# ══════════════════════════════════
#  API: OPENRICE
# ══════════════════════════════════

@app.route("/api/openrice", methods=["POST"])
def api_openrice():
    data = request.get_json(force=True)
    name = (data.get("name", "") or "").strip()
    if not name:
        return jsonify({"error": "請輸入餐廳名"}), 400
    return jsonify(search_openrice(name))


# ══════════════════════════════════
#  API: PLACES CRUD
# ══════════════════════════════════

@app.route("/api/places", methods=["GET"])
def api_list_places():
    category_id = request.args.get("category_id")
    search = request.args.get("search", "").strip()
    params = {}
    if category_id:
        params["category_id"] = category_id
    if search:
        params["search"] = search
    return jsonify({"places": places_list(params)})


@app.route("/api/places/<int:place_id>", methods=["GET"])
def api_get_place(place_id):
    place = place_by_id(place_id)
    if not place:
        return jsonify({"error": "搵唔到"}), 404
    place["memories"] = memories_for_place(place_id)
    return jsonify({"place": place})


@app.route("/api/places", methods=["POST"])
def api_create_place():
    data = request.get_json(force=True)
    name = (data.get("name", "") or "").strip()
    if not name:
        return jsonify({"error": "請輸入名稱"}), 400

    vals = {
        "name": name,
        "source_url": (data.get("source_url", "") or "").strip(),
        "source": data.get("source", "manual"),
        "address": (data.get("address", "") or "").strip(),
        "lat": _to_float(data.get("lat")),
        "lng": _to_float(data.get("lng")),
        "phone": (data.get("phone", "") or "").strip(),
        "openrice_url": (data.get("openrice_url", "") or "").strip(),
        "website": (data.get("website", "") or "").strip(),
        "category_id": _to_int(data.get("category_id")),
        "rating": data.get("rating", 0) or 0,
        "notes": (data.get("notes", "") or "").strip(),
        "created_by": data.get("created_by", "Ronald"),
    }

    cur = db.execute("""
        INSERT INTO places (name, source_url, source, address, lat, lng, phone,
                            openrice_url, website, category_id, rating, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        vals["name"], vals["source_url"], vals["source"], vals["address"],
        vals["lat"], vals["lng"], vals["phone"], vals["openrice_url"],
        vals["website"], vals["category_id"], vals["rating"], vals["notes"],
        vals["created_by"],
    ])
    place_id = cur.lastrowid
    return jsonify({"id": place_id, "message": f"已儲存 {name} ✅"}), 201


@app.route("/api/places/<int:place_id>", methods=["PUT"])
def api_update_place(place_id):
    data = request.get_json(force=True)
    if not place_by_id(place_id):
        return jsonify({"error": "搵唔到"}), 404

    updatable = ["name", "address", "lat", "lng", "phone", "openrice_url",
                 "website", "category_id", "rating", "notes"]
    sets = []
    vals = []
    for field in updatable:
        if field in data:
            val = data[field]
            if field in ("lat", "lng"):
                val = _to_float(val)
            sets.append(f"{field} = ?")
            vals.append(val)
    if not sets:
        return jsonify({"message": "冇任何更新"})
    sets.append("updated_at = ?")
    vals.append(datetime.now().isoformat())
    vals.append(place_id)
    db.execute(f"UPDATE places SET {', '.join(sets)} WHERE id = ?", vals)
    return jsonify({"message": "已更新 ✅"})


@app.route("/api/places/<int:place_id>", methods=["DELETE"])
def api_delete_place(place_id):
    place = place_by_id(place_id)
    if not place:
        return jsonify({"error": "搵唔到"}), 404
    name = place["name"]
    db.execute("DELETE FROM places WHERE id = ?", [place_id])
    return jsonify({"message": f"已刪除 {name}"})


# ══════════════════════════════════
#  API: MEMORIES
# ══════════════════════════════════

@app.route("/api/places/<int:place_id>/memories", methods=["POST"])
def api_add_memory(place_id):
    data = request.get_json(force=True)
    text = (data.get("text", "") or "").strip()
    if not text:
        return jsonify({"error": "請輸入回憶內容"}), 400
    if not place_by_id(place_id):
        return jsonify({"error": "搵唔到"}), 404
    cur = db.execute("INSERT INTO memories (place_id, text) VALUES (?, ?)", [place_id, text])
    return jsonify({"id": cur.lastrowid, "message": "回憶已儲存 💭"}), 201


@app.route("/api/places/<int:place_id>/memories/<int:memory_id>", methods=["DELETE"])
def api_delete_memory(place_id, memory_id):
    db.execute("DELETE FROM memories WHERE id = ? AND place_id = ?", [memory_id, place_id])
    return jsonify({"message": "回憶已刪除"})


# ══════════════════════════════════
#  API: CATEGORIES
# ══════════════════════════════════

@app.route("/api/categories", methods=["GET"])
def api_list_categories():
    rows = db.fetchall("""
        SELECT c.*, COUNT(p.id) as place_count
        FROM categories c
        LEFT JOIN places p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order
    """)
    return jsonify({"categories": db.dicts_from_rows(rows)})


@app.route("/api/categories", methods=["POST"])
def api_create_category():
    data = request.get_json(force=True)
    name = (data.get("name", "") or "").strip()
    if not name:
        return jsonify({"error": "請輸入類別名稱"}), 400
    try:
        cur = db.execute(
            "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
            [name, data.get("icon", "📍"), data.get("color", "#4472C4")],
        )
        return jsonify({"id": cur.lastrowid, "message": f"已新增類別 ✅"}), 201
    except Exception:
        return jsonify({"error": "呢個類別已存在"}), 409


@app.route("/api/categories/<int:cat_id>", methods=["DELETE"])
def api_delete_category(cat_id):
    db.execute("DELETE FROM categories WHERE id = ?", [cat_id])
    return jsonify({"message": "類別已刪除"})


# ══════════════════════════════════
#  API: MAP DATA
# ══════════════════════════════════

@app.route("/api/map-data", methods=["GET"])
def api_map_data():
    rows = db.fetchall("""
        SELECT p.id, p.name, p.lat, p.lng, p.address, p.rating,
               c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL
        ORDER BY p.created_at DESC
    """)
    return jsonify({"places": db.dicts_from_rows(rows)})


# ══════════════════════════════════
#  API: STATS
# ══════════════════════════════════

@app.route("/api/stats", methods=["GET"])
def api_stats():
    total_places = db.dicts_from_rows(db.fetchall("SELECT COUNT(*) as c FROM places"))[0]["c"]
    total_memories = db.dicts_from_rows(db.fetchall("SELECT COUNT(*) as c FROM memories"))[0]["c"]
    cat_rows = db.fetchall("""
        SELECT c.icon, c.name, c.color, COUNT(p.id) as count
        FROM categories c
        LEFT JOIN places p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY count DESC
    """)
    return jsonify({
        "total_places": total_places,
        "total_memories": total_memories,
        "by_category": db.dicts_from_rows(cat_rows),
    })


# ══════════════════════════════════
#  HELPERS
# ══════════════════════════════════

def _to_float(v):
    if v is None:
        return None
    try:
        return float(v)
    except (ValueError, TypeError):
        return None


def _to_int(v):
    if v is None:
        return None
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


# ══════════════════════════════════
#  WSGI entry point for gunicorn
# ══════════════════════════════════

application = app

if __name__ == "__main__":
    print(f"🔀 Packet Backend 已啟動!")
    print(f"   📍 http://localhost:{PORT}")
    print(f"   📱 iPhone 用呢個 IP 連接：http://<你電腦IP>:{PORT}")
    if os.environ.get("DATABASE_URL"):
        print(f"   ☁️  Using PostgreSQL (production mode)")
    else:
        print(f"   📋  Using SQLite (local development)")
    app.run(host=HOST, port=PORT, debug=True)