CREATE TABLE semesters {
    semester_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester INT NOT NULL CHECK (semester > 0 AND semester < 9),
    description TEXT NOT NULL
};
