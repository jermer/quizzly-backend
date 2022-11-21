"use strict";

const db = require("../db");
const Question = require("../models/question");
const { NotFoundError, BadRequestError } = require("../expressError");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Create
 */

describe("create", function () {
    test("works", async function () {
        let question = await Question.create(
            {
                qText: 'What is the new question?',
                rightA: 'This one',
                wrongA1: 'That one',
                wrongA2: 'Something else',
                wrongA3: 'None of the above',
                quizId: 111
            });
        expect(question).toEqual(
            {
                id: expect.any(Number),
                qText: 'What is the new question?',
                rightA: 'This one',
                wrongA1: 'That one',
                wrongA2: 'Something else',
                wrongA3: 'None of the above',
                quizId: 111
            }
        )
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Find all
 */

describe("findAll", function () {
    test("works: all questions", async function () {
        let questions = await Question.findAll();
        expect(questions).toEqual([
            {
                id: expect.any(Number),
                qText: 'quiz 1 first question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                quizId: 111
            },
            {
                id: expect.any(Number),
                qText: 'quiz 1 second question',
                rightA: 'yep',
                wrongA1: 'nope 1',
                wrongA2: 'nope 2',
                wrongA3: 'nope 3',
                quizId: 111
            },
            {
                id: expect.any(Number),
                qText: 'quiz 1 third question',
                rightA: 'this',
                wrongA1: 'not 1',
                wrongA2: 'not 2',
                wrongA3: 'not 3',
                quizId: 111
            },
            {
                id: expect.any(Number),
                qText: 'the only question on quiz two',
                rightA: 'correct',
                wrongA1: 'oops 1',
                wrongA2: 'oops 2',
                wrongA3: 'oops 3',
                quizId: 222
            },
        ]);
    });

    test("works: filter by quiz_id", async function () {
        let questions = await Question.findAll({ quizId: 222 });
        expect(questions).toEqual([
            {
                id: expect.any(Number),
                qText: 'the only question on quiz two',
                rightA: 'correct',
                wrongA1: 'oops 1',
                wrongA2: 'oops 2',
                wrongA3: 'oops 3',
                quizId: 222
            },
        ]);
    });
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Get
 */

describe("get", function () {
    test("works", async function () {
        // query for a question id
        // this should return a single result,
        // the only question on test quiz id = 222
        const result = await db.query(`
                SELECT id
                FROM questions
                WHERE quiz_id = $1`,
            [222]);
        const questionId = result.rows[0].id;

        let question = await Question.get(questionId);
        expect(question).toEqual({
            id: expect.any(Number),
            qText: 'the only question on quiz two',
            rightA: 'correct',
            wrongA1: 'oops 1',
            wrongA2: 'oops 2',
            wrongA3: 'oops 3',
            quizId: 222
        });
    })

    test("throws error if not found", async function () {
        try {
            let quiz = await Question.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Update
 */

describe("update", function () {
    const updateData = {
        qText: "New question text",
        rightA: "New right answer",
        wrongA1: "New wrong answer",
        wrongA2: "",
        wrongA3: ""
    }

    test("works", async function () {
        // query for a question id
        // this should return a single result,
        // the only question on test quiz id = 222
        const result = await db.query(`
                SELECT id
                FROM questions
                WHERE quiz_id = $1`,
            [222]);
        const questionId = result.rows[0].id;

        let response = await Question.update(questionId, updateData);
        expect(response).toEqual({
            id: questionId,
            qText: "New question text",
            rightA: "New right answer",
            wrongA1: "New wrong answer",
            wrongA2: "",
            wrongA3: "",
            quizId: 222
        });
    })

    test("throws not found error if invalid quiz id", async function () {
        try {
            await Question.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    test("throws bad request error if no update data", async function () {
        // query for a question id
        // this should return a single result,
        // the only question on test quiz id = 222
        const result = await db.query(`
                SELECT id
                FROM questions
                WHERE quiz_id = $1`,
            [222]);
        const questionId = result.rows[0].id;

        try {
            let quiz = await Question.update(questionId, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    })
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Remove
 */

describe("remove", function () {
    test("works", async function () {
        // query for a question id
        // this should return a single result,
        // the only question on test quiz id = 222
        const result = await db.query(`
                SELECT id
                FROM questions
                WHERE quiz_id = $1`,
            [222]);
        const questionId = result.rows[0].id;

        let response = await Question.remove(questionId);
        expect(response).toBeUndefined();

        // make a GET request to verify that the question no longer exists
        try {
            await Question.get(questionId);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    test("throws error if not found", async function () {
        try {
            let quiz = await Question.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})