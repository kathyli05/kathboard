import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Form states
  const [friendForm, setFriendForm] = useState({
    name: "",
    nickname: "",
    birthday: "",
    hometown: "",
    current_city: "",
    languages: "",
    phone: "",
    email: "",
    social_media: "",
  });

  const [noteForm, setNoteForm] = useState({
    content: "",
    category: "",
    tags: "",
  });

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchFriendDetails(selectedFriend.id);
      fetchNotes(selectedFriend.id);
    }
  }, [selectedFriend]);

  const fetchFriends = async () => {
    const response = await fetch(`${API_URL}/friends`);
    const data = await response.json();
    setFriends(data);
  };

  const fetchFriendDetails = async (friendId) => {
    const response = await fetch(`${API_URL}/friends/${friendId}`);
    const data = await response.json();
    setSelectedFriend(data);
  };

  const fetchNotes = async (friendId) => {
    const response = await fetch(`${API_URL}/friends/${friendId}/notes`);
    const data = await response.json();
    setNotes(data);
  };

  const addFriend = async (e) => {
    e.preventDefault();

    const friendData = {
      name: friendForm.name,
    };

    // Add optional fields
    if (friendForm.nickname) friendData.nickname = friendForm.nickname;
    if (friendForm.birthday) friendData.birthday = friendForm.birthday;
    if (friendForm.hometown) friendData.hometown = friendForm.hometown;
    if (friendForm.current_city) friendData.current_city = friendForm.current_city;
    if (friendForm.phone) friendData.phone = friendForm.phone;
    if (friendForm.email) friendData.email = friendForm.email;

    // Parse languages (comma-separated)
    if (friendForm.languages) {
      friendData.languages = friendForm.languages.split(",").map(l => l.trim());
    }

    // Parse social media (format: platform:handle, platform:handle)
    if (friendForm.social_media) {
      const socialMedia = {};
      friendForm.social_media.split(",").forEach(item => {
        const [platform, handle] = item.split(":").map(s => s.trim());
        if (platform && handle) {
          socialMedia[platform] = handle;
        }
      });
      friendData.social_media = socialMedia;
    }

    await fetch(`${API_URL}/friends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(friendData),
    });

    setFriendForm({
      name: "",
      nickname: "",
      birthday: "",
      hometown: "",
      current_city: "",
      languages: "",
      phone: "",
      email: "",
      social_media: "",
    });
    setShowAddFriendModal(false);
    fetchFriends();
  };

  const updateFriend = async (field, value) => {
    if (!selectedFriend) return;

    let updateData = { [field]: value };

    // Handle special fields
    if (field === "languages" && typeof value === "string") {
      updateData.languages = value.split(",").map(l => l.trim());
    }

    await fetch(`${API_URL}/friends/${selectedFriend.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    fetchFriendDetails(selectedFriend.id);
    fetchFriends();
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!selectedFriend) return;

    const noteData = {
      content: noteForm.content,
      category: noteForm.category || null,
      tags: noteForm.tags ? noteForm.tags.split(",").map(t => t.trim()) : [],
    };

    await fetch(`${API_URL}/friends/${selectedFriend.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });

    setNoteForm({ content: "", category: "", tags: "" });
    setShowAddNoteModal(false);
    fetchNotes(selectedFriend.id);
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    await fetch(`${API_URL}/notes/${noteId}`, {
      method: "DELETE",
    });

    fetchNotes(selectedFriend.id);
  };

  const toggleFavorite = async () => {
    if (!selectedFriend) return;
    const newValue = selectedFriend.is_favorite ? 0 : 1;
    await updateFriend("is_favorite", newValue);
  };

  const updateLastContacted = async () => {
    if (!selectedFriend) return;
    const now = new Date().toISOString();
    await updateFriend("last_contacted", now);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          <h2>Friends</h2>
          <button
            className="add-friend-btn"
            onClick={() => setShowAddFriendModal(true)}
          >
            + Add Friend
          </button>

          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-item ${
                  selectedFriend?.id === friend.id ? "selected" : ""
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="friend-name">
                  {friend.is_favorite ? "⭐ " : ""}{friend.name}
                </div>
                {friend.nickname && (
                  <div className="friend-nickname">"{friend.nickname}"</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          {selectedFriend ? (
            <>
              <div className="friend-header">
                <div>
                  <h1>
                    {selectedFriend.name}
                    {selectedFriend.nickname && (
                      <span className="nickname"> "{selectedFriend.nickname}"</span>
                    )}
                  </h1>
                  <button onClick={toggleFavorite} className="favorite-btn">
                    {selectedFriend.is_favorite ? "⭐ Favorited" : "☆ Add to Favorites"}
                  </button>
                  <button onClick={updateLastContacted} className="contact-btn">
                    Mark as Contacted
                  </button>
                </div>
                {selectedFriend.last_contacted && (
                  <div className="last-contacted">
                    Last contacted: {formatDate(selectedFriend.last_contacted)}
                  </div>
                )}
              </div>

              <div className="details-section">
                <h3>Personal Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Birthday</label>
                    <input
                      type="date"
                      value={selectedFriend.birthday || ""}
                      onChange={(e) => updateFriend("birthday", e.target.value)}
                    />
                  </div>
                  <div className="detail-item">
                    <label>Hometown</label>
                    <input
                      type="text"
                      value={selectedFriend.hometown || ""}
                      onChange={(e) => updateFriend("hometown", e.target.value)}
                      placeholder="Enter hometown"
                    />
                  </div>
                  <div className="detail-item">
                    <label>Current City</label>
                    <input
                      type="text"
                      value={selectedFriend.current_city || ""}
                      onChange={(e) => updateFriend("current_city", e.target.value)}
                      placeholder="Enter current city"
                    />
                  </div>
                  <div className="detail-item">
                    <label>Languages</label>
                    <input
                      type="text"
                      value={Array.isArray(selectedFriend.languages)
                        ? selectedFriend.languages.join(", ")
                        : selectedFriend.languages || ""}
                      onChange={(e) => updateFriend("languages", e.target.value)}
                      placeholder="e.g., English, Spanish"
                    />
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Contact Info</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={selectedFriend.phone || ""}
                      onChange={(e) => updateFriend("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <input
                      type="email"
                      value={selectedFriend.email || ""}
                      onChange={(e) => updateFriend("email", e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="detail-item full-width">
                    <label>Social Media</label>
                    <div className="social-media-display">
                      {selectedFriend.social_media && typeof selectedFriend.social_media === "object" ? (
                        Object.entries(selectedFriend.social_media).map(([platform, handle]) => (
                          <span key={platform} className="social-tag">
                            {platform}: @{handle}
                          </span>
                        ))
                      ) : (
                        <span className="empty-text">No social media added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="notes-section">
                <div className="notes-header">
                  <h3>Notes</h3>
                  <button
                    className="add-note-btn"
                    onClick={() => setShowAddNoteModal(true)}
                  >
                    + Add Note
                  </button>
                </div>

                <div className="notes-list">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="note-card">
                        <div className="note-header">
                          {note.category && (
                            <span className="note-category">{note.category}</span>
                          )}
                          <button
                            className="delete-note-btn"
                            onClick={() => deleteNote(note.id)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="note-content">{note.content}</div>
                        {note.tags && note.tags.length > 0 && (
                          <div className="note-tags">
                            {note.tags.map((tag, idx) => (
                              <span key={idx} className="tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="note-date">
                          {formatDate(note.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-notes">
                      <p>No notes yet. Click "Add Note" to create one!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a friend to view their details!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Friend</h2>
            <form onSubmit={addFriend}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={friendForm.name}
                  onChange={(e) => setFriendForm({...friendForm, name: e.target.value})}
                  required
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Nickname</label>
                <input
                  type="text"
                  value={friendForm.nickname}
                  onChange={(e) => setFriendForm({...friendForm, nickname: e.target.value})}
                  placeholder="Enter nickname"
                />
              </div>
              <div className="form-group">
                <label>Birthday</label>
                <input
                  type="date"
                  value={friendForm.birthday}
                  onChange={(e) => setFriendForm({...friendForm, birthday: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Hometown</label>
                <input
                  type="text"
                  value={friendForm.hometown}
                  onChange={(e) => setFriendForm({...friendForm, hometown: e.target.value})}
                  placeholder="Enter hometown"
                />
              </div>
              <div className="form-group">
                <label>Current City</label>
                <input
                  type="text"
                  value={friendForm.current_city}
                  onChange={(e) => setFriendForm({...friendForm, current_city: e.target.value})}
                  placeholder="Enter current city"
                />
              </div>
              <div className="form-group">
                <label>Languages (comma-separated)</label>
                <input
                  type="text"
                  value={friendForm.languages}
                  onChange={(e) => setFriendForm({...friendForm, languages: e.target.value})}
                  placeholder="e.g., English, Spanish, French"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={friendForm.phone}
                  onChange={(e) => setFriendForm({...friendForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={friendForm.email}
                  onChange={(e) => setFriendForm({...friendForm, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Social Media (format: platform:handle, platform:handle)</label>
                <input
                  type="text"
                  value={friendForm.social_media}
                  onChange={(e) => setFriendForm({...friendForm, social_media: e.target.value})}
                  placeholder="e.g., instagram:username, twitter:handle"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddFriendModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Add Friend</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="modal-overlay" onClick={() => setShowAddNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Note</h2>
            <form onSubmit={addNote}>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  required
                  placeholder="Write your note here..."
                  rows="5"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={noteForm.category}
                  onChange={(e) => setNoteForm({...noteForm, category: e.target.value})}
                  placeholder="e.g., conversation, gift-ideas, memories"
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})}
                  placeholder="e.g., birthday, favorite, important"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddNoteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
