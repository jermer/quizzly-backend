"use strict";

const db = require("../db");
const Quiz = require("../models/quiz");
const Question = require("../models/question");
const User = require("../models/user");

const quizIds = [];
const questionIds = [];

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
    const quiz1 = await Quiz.create(
        {
            title: 'quiz one',
            description: 'the first test quiz',
            creator: 'testuser'
        });
    const quiz2 = await Quiz.create(
        {
            title: 'quiz two',
            description: 'the second test quiz',
            creator: 'testuser2'
        });
    quizIds.push(quiz1.id, quiz2.id);

    // create some test question data
    const quest1 = await Question.create(
        {
            q_text: 'quiz 1 first question',
            right_a: 'yes',
            wrong_a1: 'no 1',
            wrong_a2: 'no 2',
            wrong_a3: 'no 3',
            question_order: 1,
            quiz_id: quiz1.id
        }
    );
    const quest2 = await Question.create(
        {
            q_text: 'quiz 1 second question',
            right_a: 'yep',
            wrong_a1: 'nope 1',
            wrong_a2: 'nope 2',
            wrong_a3: 'nope 3',
            question_order: 2,
            quiz_id: quiz1.id
        }
    );
    const quest3 = await Question.create(
        {
            q_text: 'quiz 1 third question',
            right_a: 'this',
            wrong_a1: 'not 1',
            wrong_a2: 'not 2',
            wrong_a3: 'not 3',
            question_order: 3,
            quiz_id: quiz1.id
        }
    );
    const quest4 = await Question.create(
        {
            q_text: 'the only question on quiz two',
            right_a: 'correct',
            wrong_a1: 'oops 1',
            wrong_a2: 'oops 2',
            wrong_a3: 'oops 3',
            question_order: 1,
            quiz_id: quiz2.id
        }
    );
    questionIds.push(quest1.id, quest2.id, quest3.id, quest4.id);
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
    quizIds,
    questionIds
}