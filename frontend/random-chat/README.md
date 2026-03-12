```markdown
# Stranger Chat – Interest-Based Anonymous Chat

Stranger Chat is a real-time anonymous chat application that connects users with strangers based on shared interests. The platform allows users to select topics they like and instantly start a conversation with someone who has similar interests.

This project demonstrates real-time communication using WebSockets and a simple matching algorithm to create meaningful random conversations.

---

## Idea Behind the Project

Most random chat platforms connect users completely randomly. This project improves that experience by introducing **interest-based matching**. Users can select their interests such as gaming, coding, music, or movies, and the system connects them with someone who shares similar interests.

The goal is to create a fun and experimental platform where people can meet strangers with common interests and start conversations instantly.

---

## Features

- Interest-based stranger matching  
- Real-time messaging using WebSockets  
- Typing indicator  
- Next / Skip stranger option  
- Online user statistics  
- Anti-spam protection using rate limiting  
- Anonymous chat (no login required)

---

## Technologies Used

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Socket.io

### Other
- WebSockets
- Rate Limiting (rate-limiter-flexible)

---

## How It Works

1. User selects interests.
2. The system searches for another user with similar interests.
3. If a match is found, both users are connected instantly.
4. They can send real-time messages.
5. Users can skip the current chat and connect to another stranger.

---

## Project Structure

```

stranger-chat
│
├── backend
│   └── server
│       └── server.js
│
├── frontend
│   └── random-chat
│       └── Next.js application

````

---

## Installation & Running Locally

### Backend

```bash
cd backend/server
npm install
node server.js
````

Server runs on:

```
http://localhost:3000
```

---

### Frontend

```bash
cd frontend/random-chat
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000 or http://localhost:3001
```

---

## Live Demo

Live Website:
[https://your-vercel-link.vercel.app](https://your-vercel-link.vercel.app)

Backend Server:
[https://stranger-chat-kbrm.onrender.com](https://stranger-chat-kbrm.onrender.com)

---

## GitHub Repository

[https://github.com/vikaskmalipatil/stranger-chat](https://github.com/vikaskmalipatil/stranger-chat)

---

## Future Improvements

* AI conversation starters
* Emoji reactions
* Dark mode UI
* Video chat support
* Location-based matching

---

## Author

Developed as a creative experimental project for a hackathon to demonstrate real-time communication and interest-based user matching.

```
```
