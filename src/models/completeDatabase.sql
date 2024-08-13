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
  RAISE NOTICE 'Deleting chat with id %', OLD.chat_id;
  DELETE FROM chats WHERE id=OLD.chat_id;
  RETURN OLD;
END;
$clean_chat$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_expiry()
RETURNS TRIGGER AS $update_expiry$
BEGIN
  NEW.expires_at = NOW() + INTERVAL '10 minutes';
  RETURN NEW;
END;
$update_expiry$ LANGUAGE plpgsql;


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
  is_active BOOLEAN DEFAULT FALSE,
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
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  request_type VARCHAR(255) NOT NULL CHECK(request_type IN ('signup', 'login', 'reset', 'change')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes'
);

CREATE TRIGGER set_expiry
BEFORE UPDATE ON otp
FOR EACH ROW
EXECUTE FUNCTION update_expiry();


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
    sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
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
AFTER DELETE ON subjects
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


CREATE TABLE announcements (
    announcement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachment VARCHAR(255),
    category VARCHAR(255) NOT NULL CHECK (category IN ('General', 'Class', 'Assignment', 'Assessment')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();