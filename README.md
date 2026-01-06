# kathboard
Personal friend tracker application!

## Features

### Default Friend Categories
Each friend entry includes these default fields:
- **Basic Info**: Name, Nickname, Created/Updated timestamps
- **Personal Details**: Birthday, Hometown, Current City, Languages
- **Contact Info**: Phone, Email, Social Media handles (stored as JSON)
- **Tracking**: Last Contacted date, Favorite flag

### Notes System
- Create personal notes for each friend
- Organize notes with categories (e.g., "conversation", "gift-ideas", "memories")
- Tag notes for easy searching
- Timestamp tracking (created/updated)

## API Endpoints

### Friends
- `GET /api/friends` - Get all friends
- `POST /api/friends` - Create a new friend
- `GET /api/friends/<id>` - Get a specific friend
- `PUT /api/friends/<id>` - Update a friend

### Notes
- `GET /api/friends/<id>/notes` - Get all notes for a friend
- `POST /api/friends/<id>/notes` - Create a note for a friend
- `PUT /api/notes/<id>` - Update a note
- `DELETE /api/notes/<id>` - Delete a note

### Legacy Attributes (for custom fields)
- `GET /api/friends/<id>/attributes` - Get custom attributes
- `POST /api/friends/<id>/attributes` - Set custom attribute
- `GET /api/attribute-keys` - Get all custom attribute keys

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```
