"use strict";

const db = require("../db");

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** 
 * Establish common setup and teardown for model tests.
 */
async function commonBeforeAll() {
    // clean up any existing data
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM quizzes');
    await db.query('DELETE FROM questions');
    await db.query('DELETE FROM users_quizzes');

    // create some test user data
    await db.query(`
        INSERT INTO users (username, password, email)
        VALUES ('testuser', $1, 'testuser@email.com'),
               ('testuser2', $2, 'testuser2@email.com')`,
        [
            await bcrypt.hash("password", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password", BCRYPT_WORK_FACTOR)
        ]
    );

    // create some test quiz data
    await db.query(`
        INSERT INTO quizzes (id, title, description, creator, is_public)
        VALUES (111, 'quiz one', 'the first test quiz', 'testuser', FALSE),
               (222, 'quiz two', 'the second test quiz', 'testuser2', FALSE),
               (333, 'quiz three', 'the third test quiz', 'testuser', TRUE)`
    );

    // create some questions
    await db.query(`
        INSERT INTO questions (q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id)
        VALUES ('quiz 1 first question', 'yes', 'no 1', 'no 2', 'no 3', 111),
               ('quiz 1 second question', 'yep', 'nope 1', 'nope 2', 'nope 3', 111),
               ('quiz 1 third question', 'this', 'not 1', 'not 2', 'not 3', 111),
               ('the only question on quiz two', 'correct', 'oops 1', 'oops 2', 'oops 3', 222)`
    );
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
}