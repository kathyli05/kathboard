import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect('friends.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            nickname TEXT,
            birthday TEXT,
            hometown TEXT,
            current_city TEXT,
            languages TEXT,
            phone TEXT,
            email TEXT,
            social_media TEXT,
            last_contacted TEXT,
            is_favorite INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    c.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            friend_id INTEGER,
            content TEXT NOT NULL,
            category TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

    result = []
    for friend in friends:
        friend_dict = dict(friend)
        # Parse JSON fields back to objects
        import json
        if friend_dict.get('languages'):
            try:
                friend_dict['languages'] = json.loads(friend_dict['languages'])
            except:
                pass
        if friend_dict.get('social_media'):
            try:
                friend_dict['social_media'] = json.loads(friend_dict['social_media'])
            except:
                pass
        result.append(friend_dict)

    return result

def create_friend(name, **kwargs):
    conn = get_db()
    cursor = conn.cursor()

    # Build dynamic query based on provided fields
    fields = ['name']
    values = [name]

    # Add optional default category fields
    optional_fields = ['nickname', 'birthday', 'hometown', 'current_city',
                      'languages', 'phone', 'email', 'social_media', 'is_favorite']

    for field in optional_fields:
        if field in kwargs:
            fields.append(field)
            # Convert lists and dicts to JSON strings for storage
            if isinstance(kwargs[field], (list, dict)):
                import json
                values.append(json.dumps(kwargs[field]))
            else:
                values.append(kwargs[field])

    placeholders = ','.join(['?' for _ in fields])
    query = f"INSERT INTO friends ({','.join(fields)}) VALUES ({placeholders})"

    cursor.execute(query, values)
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

def update_friend(friend_id, **kwargs):
    """Update friend with any of the default category fields"""
    conn = get_db()

    # Build dynamic update query
    updates = []
    values = []

    updatable_fields = ['name', 'nickname', 'birthday', 'hometown', 'current_city',
                       'languages', 'phone', 'email', 'social_media', 'last_contacted',
                       'is_favorite']

    for field in updatable_fields:
        if field in kwargs:
            updates.append(f"{field} = ?")
            # Convert lists and dicts to JSON strings for storage
            if isinstance(kwargs[field], (list, dict)):
                import json
                values.append(json.dumps(kwargs[field]))
            else:
                values.append(kwargs[field])

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        query = f"UPDATE friends SET {','.join(updates)} WHERE id = ?"
        values.append(friend_id)
        conn.execute(query, values)
        conn.commit()

    conn.close()

def get_friend_by_id(friend_id):
    """Get a single friend by ID"""
    conn = get_db()
    friend = conn.execute('SELECT * FROM friends WHERE id = ?', (friend_id,)).fetchone()
    conn.close()
    if friend:
        result = dict(friend)
        # Parse JSON fields back to objects
        import json
        if result.get('languages'):
            try:
                result['languages'] = json.loads(result['languages'])
            except:
                pass
        if result.get('social_media'):
            try:
                result['social_media'] = json.loads(result['social_media'])
            except:
                pass
        return result
    return None

# Notes functions
def create_note(friend_id, content, category=None, tags=None):
    """Create a new note for a friend"""
    conn = get_db()
    cursor = conn.cursor()

    # Convert tags list to JSON string
    tags_json = None
    if tags:
        import json
        tags_json = json.dumps(tags)

    cursor.execute(
        'INSERT INTO notes (friend_id, content, category, tags) VALUES (?, ?, ?, ?)',
        (friend_id, content, category, tags_json)
    )
    conn.commit()
    note_id = cursor.lastrowid
    conn.close()
    return note_id

def get_friend_notes(friend_id):
    """Get all notes for a specific friend"""
    conn = get_db()
    notes = conn.execute(
        'SELECT * FROM notes WHERE friend_id = ? ORDER BY created_at DESC',
        (friend_id,)
    ).fetchall()
    conn.close()

    result = []
    for note in notes:
        note_dict = dict(note)
        # Parse tags JSON back to list
        if note_dict.get('tags'):
            import json
            try:
                note_dict['tags'] = json.loads(note_dict['tags'])
            except:
                note_dict['tags'] = []
        result.append(note_dict)

    return result

def update_note(note_id, content=None, category=None, tags=None):
    """Update an existing note"""
    conn = get_db()

    updates = []
    values = []

    if content is not None:
        updates.append("content = ?")
        values.append(content)

    if category is not None:
        updates.append("category = ?")
        values.append(category)

    if tags is not None:
        import json
        updates.append("tags = ?")
        values.append(json.dumps(tags))

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        query = f"UPDATE notes SET {','.join(updates)} WHERE id = ?"
        values.append(note_id)
        conn.execute(query, values)
        conn.commit()

    conn.close()

def delete_note(note_id):
    """Delete a note"""
    conn = get_db()
    conn.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()