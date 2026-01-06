from flask import Flask, request, jsonify
from flask_cors import CORS
from database import (
    init_db, get_all_friends, create_friend,
    get_friend_attributes, set_friend_attribute,
    get_all_attribute_keys, update_friend_fields
)

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/api/friends', methods=['GET'])
def get_friends():
    friends = get_all_friends()
    return jsonify(friends)

@app.route('/api/friends', methods=['POST'])
def add_friend():
    data = request.json
    friend_id = create_friend(data['name'])
    return jsonify({'id': friend_id}), 201

@app.route('/api/friends/<int:friend_id>', methods=['PUT'])
def update_friend(friend_id):
    data = request.json
    update_friend_fields(friend_id, data)
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)