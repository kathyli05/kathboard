import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [allAttributeKeys, setAllAttributeKeys] = useState([]);
  const [newFriendName, setNewFriendName] = useState("");
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");

  useEffect(() => {
    fetchFriends();
    fetchAttributeKeys();
  }, []);

  const fetchFriends = async () => {
    const response = await fetch(`${API_URL}/friends`);
    const data = await response.json();
    setFriends(data);
  };

  const fetchAttributeKeys = async () => {
    const response = await fetch(`${API_URL}/attribute-keys`);
    const data = await response.json();
    setAllAttributeKeys(data);
  };

  const fetchAttributes = async (friendId) => {
    const response = await fetch(`${API_URL}/friends/${friendId}/attributes`);
    const data = await response.json();

    // Convert array to object for easier access
    const attrObj = {};
    data.forEach((attr) => {
      attrObj[attr.key] = attr.value;
    });
    setAttributes(attrObj);
  };

  const addFriend = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/friends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFriendName }),
    });
    setNewFriendName("");
    fetchFriends();
  };

  const addAttribute = async (e) => {
    e.preventDefault();
    if (!selectedFriend) return;

    await fetch(`${API_URL}/friends/${selectedFriend.id}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: newAttributeKey, value: newAttributeValue }),
    });

    setNewAttributeKey("");
    setNewAttributeValue("");
    fetchAttributes(selectedFriend.id);
    fetchAttributeKeys();
  };

  const updateAttribute = async (key, value) => {
    if (!selectedFriend) return;

    await fetch(`${API_URL}/friends/${selectedFriend.id}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });

    fetchAttributes(selectedFriend.id);
  };

  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    fetchAttributes(friend.id);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          <h2>Friends</h2>
          <form onSubmit={addFriend} className="add-friend-form">
            <input
              type="text"
              placeholder="Friend's name"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              required
            />
            <button type="submit">Add Friend</button>
          </form>

          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-item ${
                  selectedFriend?.id === friend.id ? "selected" : ""
                }`}
                onClick={() => selectFriend(friend)}
              >
                {friend.name}
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          {selectedFriend ? (
            <>
              <h1>{selectedFriend.name}</h1>

              <div className="attributes">
                <h3>Details</h3>
                {allAttributeKeys.map((key) => (
                  <div key={key} className="attribute-row">
                    <label>{key}:</label>
                    <input
                      type="text"
                      value={attributes[key] || ""}
                      onChange={(e) => {
                        setAttributes({ ...attributes, [key]: e.target.value });
                      }}
                      onBlur={(e) => updateAttribute(key, e.target.value)}
                      placeholder={`Add ${key}`}
                    />
                  </div>
                ))}
              </div>

              <form onSubmit={addAttribute} className="add-attribute-form">
                <h3>Add New Detail</h3>
                <input
                  type="text"
                  placeholder="Detail name (e.g., favorite color)"
                  value={newAttributeKey}
                  onChange={(e) => setNewAttributeKey(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  required
                />
                <button type="submit">Add Detail</button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a friend to view their details!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
