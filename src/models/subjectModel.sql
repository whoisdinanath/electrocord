CREATE TABLE subject {
    subject_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    semester_id UUID NOT NULL,
    syllabus TEXT NOT NULL,
    description TEXT NOT NULL,
    chat_id UUID NOT NULL,
    FOREIGN KEY (chat_id) NOT NULL UNIQUE REFERENCES chats(id),
    FOREIGN KEY (semester_id) NOT NULL REFERENCES semester(semester_id),
}