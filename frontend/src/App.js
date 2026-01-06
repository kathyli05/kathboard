import React, { useState, useEffect } from "react";
import "./App.css";
import RichNotes from "./RichNotes";

const API_URL = import.meta.env.VITE_API_URL;

const CORE_FIELDS = [
  { key: "birthday", label: "birthday", type: "date" },
  { key: "hometown", label: "hometown", type: "text" },
  { key: "ethnicity", label: "ethnicity", type: "text" },
  { key: "university", label: "university", type: "text" },
  { key: "concentration", label: "concentration", type: "text" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "", label: "select..." },
  { value: "brown", label: "brown" },
  { value: "google", label: "google" },
  { value: "davis", label: "davis" },
  { value: "other", label: "other" },
];

function App() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [allAttributeKeys, setAllAttributeKeys] = useState([]);
  const [newFriendName, setNewFriendName] = useState("");
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [coreInfo, setCoreInfo] = useState({});
  const [notes, setNotes] = useState("");
  const [relationshipContext, setRelationshipContext] = useState("");
  const [hidden, setHidden] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  useEffect(() => {
    fetchAttributeKeys();
  }, []);

  useEffect(() => {
    fetchFriends(query);
  }, [query, showHidden]);

  const fetchFriends = async (q = "") => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("include_hidden", showHidden ? "true" : "false");

    const url = `${API_URL}/friends?${params.toString()}`;
    const response = await fetch(url);
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
    fetchFriends(query);
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

  const updateCoreField = async (key, value) => {
    if (!selectedFriend) return;

    await fetch(`${API_URL}/friends/${selectedFriend.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  };

  const updateNotes = async (value) => {
    if (!selectedFriend) return;

    await fetch(`${API_URL}/friends/${selectedFriend.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: value }),
    });

    setFriends((prev) =>
      prev.map((f) => (f.id === selectedFriend.id ? { ...f, notes: value } : f))
    );
    setSelectedFriend((prev) => (prev ? { ...prev, notes: value } : prev));
  };

  useEffect(() => {
    if (!selectedFriend || !notesDirty) return;

    const timeout = setTimeout(() => {
      updateNotes(notes);
      setNotesDirty(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [notes, notesDirty, selectedFriend?.id]);

  const updateRelationshipContext = async (value) => {
    if (!selectedFriend) return;
    setRelationshipContext(value);

    await fetch(`${API_URL}/friends/${selectedFriend.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relationship_context: value }),
    });

    // Update local friends list
    setFriends(
      friends.map((f) =>
        f.id === selectedFriend.id ? { ...f, relationship_context: value } : f
      )
    );
  };

  const toggleHidden = async () => {
    if (!selectedFriend) return;
    const newHidden = !hidden;
    setHidden(newHidden);

    await fetch(`${API_URL}/friends/${selectedFriend.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: newHidden }),
    });

    // Update local friends list
    setFriends(
      friends.map((f) =>
        f.id === selectedFriend.id ? { ...f, hidden: newHidden } : f
      )
    );
  };

  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    setCoreInfo({
      birthday: friend.birthday || "",
      hometown: friend.hometown || "",
      ethnicity: friend.ethnicity || "",
      university: friend.university || "",
      concentration: friend.concentration || "",
    });
    setNotes(friend.notes || "");
    setNotesDirty(false);
    setRelationshipContext(friend.relationship_context || "");
    setHidden(friend.hidden || false);
    fetchAttributes(friend.id);
  };

  const visibleFriends = friends;

  const hiddenCount = friends.filter((f) => f.hidden).length;

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          <h2>Friends</h2>

          <input
            type="text"
            className="friend-search"
            placeholder="search friends…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {hiddenCount > 0 && (
            <label className="show-hidden-toggle">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
              />
              Show hidden ({hiddenCount})
            </label>
          )}

          <div className="friends-list">
            {visibleFriends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-item ${
                  selectedFriend?.id === friend.id ? "selected" : ""
                } ${friend.hidden ? "hidden-friend" : ""}`}
                onClick={() => selectFriend(friend)}
              >
                <span className="friend-name">{friend.name}</span>
                {friend.relationship_context && (
                  <span className="friend-context">
                    {
                      RELATIONSHIP_OPTIONS.find(
                        (o) => o.value === friend.relationship_context
                      )?.label
                    }
                  </span>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={addFriend} className="add-friend-form">
            <input
              type="text"
              placeholder="friend's name"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              required
            />
            <button type="submit">add friend</button>
          </form>
        </div>

        <div className="main-content">
          {selectedFriend ? (
            <>
              <div className="friend-header">
                <h1>{selectedFriend.name}</h1>
                <button
                  className={`hide-toggle ${hidden ? "is-hidden" : ""}`}
                  onClick={toggleHidden}
                >
                  {hidden ? "Unhide" : "Hide"}
                </button>
              </div>

              <div className="main-inner">
                <div className="relationship-section">
                  <label>how i know them:</label>
                  <select
                    value={relationshipContext}
                    onChange={(e) => updateRelationshipContext(e.target.value)}
                  >
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="core-info">
                  <h3>Core Info</h3>
                  {CORE_FIELDS.map((field) => (
                    <div key={field.key} className="attribute-row">
                      <label>{field.label}:</label>
                      <input
                        type={field.type}
                        value={coreInfo[field.key] || ""}
                        onChange={(e) => {
                          setCoreInfo({
                            ...coreInfo,
                            [field.key]: e.target.value,
                          });
                        }}
                        onBlur={(e) =>
                          updateCoreField(field.key, e.target.value)
                        }
                        placeholder={`add ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="attributes">
                  <h3>Other Details</h3>
                  {allAttributeKeys.map((key) => (
                    <div key={key} className="attribute-row">
                      <label>{key}:</label>
                      <input
                        type="text"
                        value={attributes[key] || ""}
                        onChange={(e) => {
                          setAttributes({
                            ...attributes,
                            [key]: e.target.value,
                          });
                        }}
                        onBlur={(e) => updateAttribute(key, e.target.value)}
                        placeholder={`Add ${key}`}
                      />
                    </div>
                  ))}
                </div>

                <form onSubmit={addAttribute} className="add-attribute-form">
                  <h3>add new detail</h3>
                  <input
                    type="text"
                    placeholder="attribute name (e.g., favorite color)"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="value"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    required
                  />
                  <button type="submit">add attribute</button>
                </form>

                <div className="notes-section">
                  <h3>Notes</h3>
                  <RichNotes
                    value={notes}
                    onChange={(html) => {
                      setNotes(html);
                      setNotesDirty(true);
                    }}
                    placeholder="anything else i want to remember..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>select a friend to view their details!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
