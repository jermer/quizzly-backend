"use strict";

const db = require("../db");
const Question = require("../models/question");
const { NotFoundError } = require("../expressError");

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
                q_text: 'What is the new question?',
                right_a: 'This one',
                wrong_a1: 'That one',
                wrong_a2: 'Something else',
                wrong_a3: 'None of the above',
                question_order: 1,
                quiz_id: 111
            });
        expect(question).toEqual(
            {
                id: expect.any(Number),
                q_text: 'What is the new question?',
                right_a: 'This one',
                wrong_a1: 'That one',
                wrong_a2: 'Something else',
                wrong_a3: 'None of the above',
                question_order: 1,
                quiz_id: 111
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
                q_text: 'quiz 1 first question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: 111
            },
            {
                id: expect.any(Number),
                q_text: 'quiz 1 second question',
                right_a: 'yep',
                wrong_a1: 'nope 1',
                wrong_a2: 'nope 2',
                wrong_a3: 'nope 3',
                question_order: 2,
                quiz_id: 111
            },
            {
                id: expect.any(Number),
                q_text: 'quiz 1 third question',
                right_a: 'this',
                wrong_a1: 'not 1',
                wrong_a2: 'not 2',
                wrong_a3: 'not 3',
                question_order: 3,
                quiz_id: 111
            },
            {
                id: expect.any(Number),
                q_text: 'the only question on quiz two',
                right_a: 'correct',
                wrong_a1: 'oops 1',
                wrong_a2: 'oops 2',
                wrong_a3: 'oops 3',
                question_order: 1,
                quiz_id: 222
            },
        ]);
    });

    test("works: filter by quiz_id", async function () {
        let questions = await Question.findAll({ quiz_id: 222 });
        expect(questions).toEqual([
            {
                id: expect.any(Number),
                q_text: 'the only question on quiz two',
                right_a: 'correct',
                wrong_a1: 'oops 1',
                wrong_a2: 'oops 2',
                wrong_a3: 'oops 3',
                question_order: 1,
                quiz_id: 222
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
            q_text: 'the only question on quiz two',
            right_a: 'correct',
            wrong_a1: 'oops 1',
            wrong_a2: 'oops 2',
            wrong_a3: 'oops 3',
            question_order: 1,
            quiz_id: 222
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