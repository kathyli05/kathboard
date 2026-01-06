import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL")

def _connect():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL env var is not set")
    # DATABASE_URL should already include sslmode=require for Neon/Supabase
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=psycopg2.extras.RealDictCursor,
        sslmode="require",
    )
    
def init_db():
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS friends (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    birthday TEXT,
                    notes TEXT,
                    ethnicity TEXT,
                    university TEXT,
                    concentration TEXT,
                    hometown TEXT,
                    relationship_context TEXT,
                    hidden BOOLEAN DEFAULT FALSE
                );
            """)

            cur.execute("""
                CREATE TABLE IF NOT EXISTS attributes (
                    id SERIAL PRIMARY KEY,
                    friend_id INTEGER REFERENCES friends(id) ON DELETE CASCADE,
                    key TEXT NOT NULL,
                    value TEXT
                );
            """)
        conn.commit()

def get_all_friends():
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM friends ORDER BY created_at DESC;")
            return cur.fetchall()

def search_friends_by_name(q: str = "", include_hidden: bool = False):
    term = (q or "").strip()
    like = f"%{term}%"

    with _connect() as conn:
        with conn.cursor() as cur:
            if include_hidden:
                cur.execute(
                    """
                    SELECT * FROM friends
                    WHERE name ILIKE %s
                    ORDER BY created_at DESC
                    """,
                    (like,),
                )
            else:
                cur.execute(
                    """
                    SELECT * FROM friends
                    WHERE name ILIKE %s
                      AND hidden = FALSE
                    ORDER BY created_at DESC
                    """,
                    (like,),
                )
            return cur.fetchall()

def create_friend(name):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO friends (name) VALUES (%s) RETURNING id;",
                (name,),
            )
            friend_id = cur.fetchone()["id"]
        conn.commit()
    return friend_id

def get_friend_attributes(friend_id):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM attributes WHERE friend_id = %s ORDER BY id ASC;",
                (friend_id,),
            )
            return cur.fetchall()

def set_friend_attribute(friend_id, key, value):
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM attributes WHERE friend_id = %s AND key = %s;",
                (friend_id, key),
            )
            existing = cur.fetchone()

            if existing:
                cur.execute(
                    "UPDATE attributes SET value = %s WHERE friend_id = %s AND key = %s;",
                    (value, friend_id, key),
                )
            else:
                cur.execute(
                    "INSERT INTO attributes (friend_id, key, value) VALUES (%s, %s, %s);",
                    (friend_id, key, value),
                )
        conn.commit()

def get_all_attribute_keys():
    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT DISTINCT key FROM attributes ORDER BY key ASC;")
            rows = cur.fetchall()
            return [r["key"] for r in rows]

def update_friend_fields(friend_id, fields):
    allowed = {
        "birthday", "notes", "ethnicity", "university",
        "concentration", "hometown", "relationship_context", "hidden"
    }

    # Build dynamic update safely
    updates = []
    values = []
    for key, value in (fields or {}).items():
        if key in allowed:
            updates.append(f"{key} = %s")
            values.append(value)

    if not updates:
        return

    values.append(friend_id)
    sql = f"UPDATE friends SET {', '.join(updates)} WHERE id = %s;"

    with _connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, values)
        conn.commit()
