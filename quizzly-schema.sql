CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1)
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(25) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    creator VARCHAR(25) NOT NULL
      REFERENCES users ON DELETE CASCADE
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    q_text TEXT NOT NULL,
    right_a TEXT NOT NULL,
    wrong_a1 TEXT NOT NULL,
    wrong_a2 TEXT NOT NULL,
    wrong_a3 TEXT NOT NULL,
    quiz_id INTEGER NOT NULL
      REFERENCES quizzes ON DELETE CASCADE,
    -- Optional columns to allow for future features
    q_order INTEGER,    
    q_type VARCHAR(25),
    is_timed BOOLEAN DEFAULT FALSE
);

CREATE TABLE users_quizzes (
  username VARCHAR(25) NOT NULL
    REFERENCES users ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL
    REFERENCES quizzes ON DELETE CASCADE,
  score INTEGER NOT NULL,
  PRIMARY KEY (username, quiz_id)
);

-- CREATE TABLE companies (
--   handle VARCHAR(25) PRIMARY KEY CHECK (handle = lower(handle)),
--   name TEXT UNIQUE NOT NULL,
--   num_employees INTEGER CHECK (num_employees >= 0),
--   description TEXT NOT NULL,
--   logo_url TEXT
-- );

-- CREATE TABLE jobs (
--   id SERIAL PRIMARY KEY,
--   title TEXT NOT NULL,
--   salary INTEGER CHECK (salary >= 0),
--   equity NUMERIC CHECK (equity <= 1.0),
--   company_handle VARCHAR(25) NOT NULL
--     REFERENCES companies ON DELETE CASCADE
-- );

-- CREATE TABLE applications (
--   username VARCHAR(25)
--     REFERENCES users ON DELETE CASCADE,
--   job_id INTEGER
--     REFERENCES jobs ON DELETE CASCADE,
--   PRIMARY KEY (username, job_id)
-- );
