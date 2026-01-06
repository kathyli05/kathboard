import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('friends.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            friend_id INTEGER,
            key TEXT NOT NULL,
            value TEXT,
            FOREIGN KEY (friend_id) REFERENCES friends(id)
        )
    ''')
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect('friends.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_all_friends():
    conn = get_db()
    friends = conn.execute('SELECT * FROM friends').fetchall()
    conn.close()
    return [dict(f) for f in friends]

def create_friend(name):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO friends (name) VALUES (?)', (name,))
    conn.commit()
    friend_id = cursor.lastrowid
    conn.close()
    return friend_id

def get_friend_attributes(friend_id):
    conn = get_db()
    attrs = conn.execute(
        'SELECT * FROM attributes WHERE friend_id = ?',
        (friend_id,)
    ).fetchall()
    conn.close()
    return [dict(a) for a in attrs]

def set_friend_attribute(friend_id, key, value):
    conn = get_db()
    # Check if attribute exists
    existing = conn.execute(
        'SELECT id FROM attributes WHERE friend_id = ? AND key = ?',
        (friend_id, key)
    ).fetchone()
    
    if existing:
        # Update
        conn.execute(
            'UPDATE attributes SET value = ? WHERE friend_id = ? AND key = ?',
            (value, friend_id, key)
        )
    else:
        # Insert
        conn.execute(
            'INSERT INTO attributes (friend_id, key, value) VALUES (?, ?, ?)',
            (friend_id, key, value)
        )
    conn.commit()
    conn.close()

def get_all_attribute_keys():
    conn = get_db()
    keys = conn.execute('SELECT DISTINCT key FROM attributes').fetchall()
    conn.close()
    return [k['key'] for k in keys]