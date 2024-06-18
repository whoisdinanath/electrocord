CREATE TABLE chats {
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
}

CREATE TABLE general_chat {
    chat_id UUID PRIMARY KEY REFERENCES chats(id),
    chat_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
}