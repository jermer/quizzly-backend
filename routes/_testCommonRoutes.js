"use strict";

const db = require("../db");
const Quiz = require("../models/quiz");
const User = require("../models/user");

const quizIds = [];

async function commonBeforeAll() {
    // clean up any existing data
    await db.query('DELETE from users')
    await db.query('DELETE FROM quizzes');
    await db.query('DELETE FROM questions');

    // create some test users
    const u1 = await User.register({
        username: 'testuser',
        password: 'password',
        firstName: 'First',
        lastName: 'Last',
        email: 'testuser@email.com'
    });
    const u2 = await User.register({
        username: 'testuser2',
        password: 'password',
        firstName: 'First2',
        lastName: 'Last2',
        email: 'testuser2@email.com'
    });

    // create some test quiz data
    const q1 = await Quiz.create(
        {
            title: 'quiz one',
            description: 'the first test quiz'
        });
    const q2 = await Quiz.create(
        {
            title: 'quiz two',
            description: 'the second test quiz'
        });
    quizIds.push(q1.id, q2.id);
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
    quizIds
}