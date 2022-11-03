"use strict";

const db = require("../db");
const Quiz = require("../models/quiz");

const quizIds = [];

async function commonBeforeAll() {
    // clean up any existing data
    await db.query(`DELETE FROM quizzes`);
    await db.query(`DELETE FROM questions`);

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