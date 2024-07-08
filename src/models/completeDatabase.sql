DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS general_chats;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS otp;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS semesters;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $update_timestamp$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$update_timestamp$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_unused_otp()
RETURNS TRIGGER AS $delete_otp$
BEGIN
  DELETE FROM otp WHERE expires_at < NOW();
  RETURN NEW;
END;
$delete_otp$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_chat_before_subject()
RETURNS TRIGGER AS $clean_chat$
BEGIN
  DELETE FROM chats WHERE id=NEW.chat_id;
  RETURN NEW;
END;
$clean_chat$ LANGUAGE plpgsql;


CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  dob DATE NOT NULL CHECK (dob <= CURRENT_DATE),
  password VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);



CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE otp (
  otp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes'
);



CREATE TRIGGER delete_unused_otp
BEFORE INSERT ON otp
FOR EACH ROW
EXECUTE FUNCTION delete_unused_otp();

CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL DEFAULT 'General',
  type VARCHAR(255) NOT NULL CHECK(type IN ('audio', 'text')),
  description TEXT,
  category VARCHAR(255) NOT NULL CHECK (category IN ('general', 'subject')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, category)
);


CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE general_chats (
    chat_id UUID PRIMARY KEY REFERENCES chats(id),
    general_category VARCHAR(255) NOT NULL CHECK(general_category IN ('general', 'private', 'announcement', 'group')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE semesters (
    semester_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester INT UNIQUE NOT NULL CHECK (semester > 0 AND semester < 9),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE subjects (
    subject_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    semester_id UUID NOT NULL REFERENCES semesters(semester_id) ON DELETE CASCADE,
    syllabus TEXT,
    description TEXT,
    chat_id UUID NOT NULL UNIQUE REFERENCES chats(id), 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER clean_subject_chat
BEFORE DELETE ON subjects
FOR EACH ROW
EXECUTE FUNCTION delete_chat_before_subject();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL CHECK (category IN ('Notes', 'PQ', 'Assignments', 'Links', 'Others')),
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    day VARCHAR(255) NOT NULL CHECK (day IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    category VARCHAR(255) NOT NULL CHECK (category IN ('Lecture', 'Lab', 'Assessment')),
    grp VARCHAR(255) NOT NULL CHECK (grp IN ('A', 'B', 'Both')),
    teacher VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON routines
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



CREATE TABLE message_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    uploaded_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON message_attachments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

