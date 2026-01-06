from flask import Flask, request, jsonify
from flask_cors import CORS
from database import (
    init_db, get_all_friends, create_friend, update_friend, get_friend_by_id,
    get_friend_attributes, set_friend_attribute, get_all_attribute_keys,
    create_note, get_friend_notes, update_note, delete_note
)

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/friends', methods=['GET'])
def get_friends():
    friends = get_all_friends()
    return jsonify(friends)

@app.route('/api/friends', methods=['POST'])
def add_friend():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400

    # Extract optional default category fields
    optional_fields = {}
    for field in ['nickname', 'birthday', 'hometown', 'current_city',
                  'languages', 'phone', 'email', 'social_media', 'is_favorite']:
        if field in data:
            optional_fields[field] = data[field]

    friend_id = create_friend(name, **optional_fields)
    return jsonify({'id': friend_id}), 201

@app.route('/api/friends/<int:friend_id>', methods=['GET'])
def get_friend(friend_id):
    friend = get_friend_by_id(friend_id)
    if friend:
        return jsonify(friend)
    return jsonify({'error': 'Friend not found'}), 404

@app.route('/api/friends/<int:friend_id>', methods=['PUT'])
def update_friend_route(friend_id):
    data = request.json
    update_friend(friend_id, **data)
    return jsonify({'success': True})

@app.route('/api/friends/<int:friend_id>/attributes', methods=['GET'])
def get_attributes(friend_id):
    attrs = get_friend_attributes(friend_id)
    return jsonify(attrs)

@app.route('/api/friends/<int:friend_id>/attributes', methods=['POST'])
def set_attribute(friend_id):
    data = request.json
    set_friend_attribute(friend_id, data['key'], data['value'])
    return jsonify({'success': True})

@app.route('/api/attribute-keys', methods=['GET'])
def get_attribute_keys():
    keys = get_all_attribute_keys()
    return jsonify(keys)

# Notes endpoints
@app.route('/api/friends/<int:friend_id>/notes', methods=['GET'])
def get_notes(friend_id):
    notes = get_friend_notes(friend_id)
    return jsonify(notes)

@app.route('/api/friends/<int:friend_id>/notes', methods=['POST'])
def add_note(friend_id):
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({'error': 'Content is required'}), 400

    category = data.get('category')
    tags = data.get('tags', [])

    note_id = create_note(friend_id, content, category, tags)
    return jsonify({'id': note_id}), 201

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note_route(note_id):
    data = request.json
    content = data.get('content')
    category = data.get('category')
    tags = data.get('tags')

    update_note(note_id, content=content, category=category, tags=tags)
    return jsonify({'success': True})

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note_route(note_id):
    delete_note(note_id)
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)