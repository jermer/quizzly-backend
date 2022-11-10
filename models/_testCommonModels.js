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

    // create some test user data
    await db.query(`
        INSERT INTO users (username, password, first_name, last_name, email)
        VALUES ('testuser', $1, 'First', 'Last', 'testuser@email.com'),
               ('testuser2', $2, 'First2', 'Last2', 'testuser2@email.com')`,
        [
            await bcrypt.hash("password", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password", BCRYPT_WORK_FACTOR)
        ]
    );

    // create some test quiz data
    await db.query(`
        INSERT INTO quizzes (id, title, description, creator)
        VALUES (111, 'quiz one', 'the first test quiz', 'testuser'),
               (222, 'quiz two', 'the second test quiz', 'testuser2'),
               (333, 'quiz three', 'the third test quiz', 'testuser')`
    );

    // create some questions
    await db.query(`
        INSERT INTO questions (q_text, right_a, wrong_a1, wrong_a2, wrong_a3, question_order, quiz_id)
        VALUES ('quiz 1 first question', 'yes', 'no 1', 'no 2', 'no 3', 1, 111),
               ('quiz 1 second question', 'yep', 'nope 1', 'nope 2', 'nope 3', 2, 111),
               ('quiz 1 third question', 'this', 'not 1', 'not 2', 'not 3', 3, 111),
               ('the only question on quiz two', 'correct', 'oops 1', 'oops 2', 'oops 3', 1, 222)`
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