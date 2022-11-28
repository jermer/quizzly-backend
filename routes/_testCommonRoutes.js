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
    await db.query('DELETE FROM users_quizzes');

    // create some test users
    const u1 = await User.register({
        username: 'testuser',
        password: 'password',
        email: 'testuser@email.com'
    });
    const u2 = await User.register({
        username: 'testuser2',
        password: 'password',
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
    const quiz3 = await Quiz.create(
        {
            title: 'quiz three',
            description: 'the third test quiz',
            creator: 'testuser',
            isPublic: true
        });
    quizIds.push(quiz1.id, quiz2.id, quiz3.id);

    // create some test question data
    const quest1 = await Question.create(
        {
            qText: 'quiz 1 first question',
            rightA: 'yes',
            wrongA1: 'no 1',
            wrongA2: 'no 2',
            wrongA3: 'no 3',
            quizId: quiz1.id
        }
    );
    const quest2 = await Question.create(
        {
            qText: 'quiz 1 second question',
            rightA: 'yep',
            wrongA1: 'nope 1',
            wrongA2: 'nope 2',
            wrongA3: 'nope 3',
            quizId: quiz1.id
        }
    );
    const quest3 = await Question.create(
        {
            qText: 'quiz 1 third question',
            rightA: 'this',
            wrongA1: 'not 1',
            wrongA2: 'not 2',
            wrongA3: 'not 3',
            quizId: quiz1.id
        }
    );
    const quest4 = await Question.create(
        {
            qText: 'the only question on quiz two',
            rightA: 'correct',
            wrongA1: 'oops 1',
            wrongA2: 'oops 2',
            wrongA3: 'oops 3',
            quizId: quiz2.id
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