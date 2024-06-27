CREATE TABLE chats {
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  name VARCHAR(255) NOT NULL DEFAULT 'general',
  type VARCHAR(255) NOT NULL CHECK(type IN ('audio', 'text')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
}

CREATE TABLE general_chat {
    chat_id UUID PRIMARY KEY REFERENCES chats(id),
    chat_name VARCHAR(255) NOT NULL,
    chat_category VARCHAR(255) NOT NULL CHECK(chat_category IN ('general', 'private', 'announcement', 'group')),
    created_at TIMESTAMP DEFAULT NOW(),
}