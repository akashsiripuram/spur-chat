# Spur Chat

Spur Chat is a small customer-support chat app. It has a React/Vite frontend with a floating chat widget and an Express/TypeScript backend that stores conversations in PostgreSQL and uses Groq as the LLM provider for AI support replies.

## Features

- Floating customer-support chat widget
- Conversation history persisted in PostgreSQL
- Conversation restore using `conversationId` saved in `localStorage`
- Store FAQ/domain knowledge included in the LLM system prompt

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- LLM provider: Groq SDK
- Default model: `openai/gpt-oss-20b`

## Project Structure

```text
spur-chat/
  backend/
    app.ts
    controllers/
      chat.controller.ts
      conversation.controller.ts
    db/
      db.ts
    routes/
      chatRoutes.ts
      conversationRoutes.ts
    utils/
      getLlmResponse.ts
      getMessages.ts
  frontend/
    src/
      App.tsx
      FloatingIcon/FloatingIcon.tsx
```

## Backend Architecture

The backend is split into a few small layers:

- `backend/app.ts`: creates the Express app, connects to the database, configures CORS/JSON middleware, and mounts routes.
- `backend/routes`: defines HTTP route paths and maps them to controllers.
- `backend/controllers`: handles request/response logic for conversations and chat messages.
- `backend/db/db.ts`: creates and exports the PostgreSQL client.
- `backend/utils/getMessages.ts`: fetches conversation history from the database.
- `backend/utils/getLlmResponse.ts`: wraps the Groq LLM call and builds the prompt with conversation history.

A useful design choice is that LLM-specific code is isolated in `getLlmResponse.ts`, so changing providers later should not require rewriting the route/controller layer.

## API Endpoints

### Create Conversation

```http
POST /chat/createConversation
```

Response:

```json
{
  "success": true,
  "conversation_id": "uuid"
}
```

### Send Message

```http
POST /chat/message
```

Request:

```json
{
  "userPrompt": "What is your return policy?",
  "conversation_id": "uuid"
}
```

Response:

```json
{
  "aiResponse": "We accept returns within 30 days of delivery...",
  "conversation_id": "uuid"
}
```

### Fetch Conversation History

```http
GET /chat/:conversationId
```

Response:

```json
{
  "success": true,
  "conversation_id": "uuid",
  "messages": []
}
```

## Local Setup

### 1. Clone and install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2. Create backend environment file

Create `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/spur_chat
GROQ_API_KEY=your_groq_api_key_here
```

Update `DATABASE_URL` to match your local PostgreSQL username, password, host, port, and database name.

### 3. Set up the database

Create the database:

```bash
createdb spur_chat
```

This project is meant to use PostgreSQL. Run this SQL in your PostgreSQL database:

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

If you are using Neon, paste and run the SQL in the Neon SQL editor after setting `DATABASE_URL` to the Neon PostgreSQL connection string.

If you are running PostgreSQL locally, run it in your `psql` terminal:

```bash
psql "postgres://postgres:postgres@localhost:5432/spur_chat"
```

Then paste the SQL above.

If Prisma is added later, the schema can be represented in Prisma models and migrations can be generated and run through the backend workflow instead of manually pasting SQL.

### 4. Start the backend

From `backend/`:

```bash
npm run start
```

The backend runs on `http://localhost:3000` by default.

### 5. Start the frontend

From `frontend/`:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Defaults to `3000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `GROQ_API_KEY` | Yes | API key used by the Groq SDK. |

### Frontend

The frontend currently calls the backend at `http://localhost:3000` directly in `frontend/src/FloatingIcon/FloatingIcon.tsx`. For deployment, this should be moved to a Vite env var such as `VITE_API_URL`.

## LLM Notes

This project uses Groq through the `groq-sdk` package. The current model is:

```text
openai/gpt-oss-20b
```

The prompt is built in `backend/utils/getLlmResponse.ts`. It includes:

- a system message that defines the assistant as Spur Store's customer-support agent
- store policies for shipping, returns, refunds, support hours, cancellations, exchanges, and free shipping
- guardrails telling the assistant not to invent live order, tracking, inventory, account, or payment details
- conversation history from PostgreSQL, mapped into user/assistant messages
- the latest user message

The domain knowledge is currently hardcoded in the system prompt instead of being stored in the database. This keeps the project simple and reliable for a small demo.

## Current Trade-offs

- The frontend API URL is hardcoded to `http://localhost:3000`.
- There is no migration runner yet; database setup is documented as SQL in this README.
- There is no seed script because FAQ knowledge lives in the LLM prompt.
- Backend validation is minimal and should be strengthened for production use.
- LLM failures are caught at the controller level, but the LLM wrapper could return a friendlier fallback message.
- Conversation IDs are stored in browser `localStorage`; there is no auth or user account model.
- The backend sends full conversation history to the LLM, which is simple but could become expensive for long chats.

## If I Had More Time

- Add a real migration tool such as Prisma, Drizzle, Knex, or node-pg-migrate.
- Add `.env.example` files for backend and frontend.
- Move the frontend backend URL into `VITE_API_URL`.
- Add request validation for empty messages, missing conversation IDs, and very long messages.
- Add token/history limits before calling the LLM.
- Add automated tests for routes, persistence, and LLM error handling.
- Add streaming responses for a more natural chat experience.
- Store FAQ/domain knowledge in the database or a structured config file.
- Add deployment instructions for Render/Vercel/Netlify once the app is hosted.
