"use strict";

// const db = require("../db");
const Quiz = require("../models/quiz");
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
        let quiz = await Quiz.create(
            {
                title: "new quiz",
                description: "a very cool new quiz",
                creator: 'testuser'
            });
        expect(quiz).toEqual(
            {
                id: expect.any(Number),
                title: "new quiz",
                description: "a very cool new quiz",
                creator: 'testuser'
            }
        )
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Find all
 */

describe("findAll", function () {
    test("works: all quizzes", async function () {
        let quizzes = await Quiz.findAll();
        expect(quizzes).toEqual([
            {
                id: 111,
                title: 'quiz one',
                description: 'the first test quiz',
                creator: 'testuser'
            },
            {
                id: 222,
                title: 'quiz two',
                description: 'the second test quiz',
                creator: 'testuser2'
            },
            {
                id: 333,
                title: 'quiz three',
                description: 'the third test quiz',
                creator: 'testuser'
            }
        ]);
    });

    // TODO: test filtering
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Get
 */

describe("get", function () {
    test("works", async function () {
        let quiz = await Quiz.get(111);
        expect(quiz).toEqual({
            id: 111,
            title: 'quiz one',
            creator: 'testuser',
            description: 'the first test quiz',
            questions: [
                {
                    id: expect.any(Number),
                    qText: 'quiz 1 first question',
                    rightA: 'yes',
                    wrongA1: 'no 1',
                    wrongA2: 'no 2',
                    wrongA3: 'no 3',
                    questionOrder: 1,
                    quizId: 111
                },
                {
                    id: expect.any(Number),
                    qText: 'quiz 1 second question',
                    rightA: 'yep',
                    wrongA1: 'nope 1',
                    wrongA2: 'nope 2',
                    wrongA3: 'nope 3',
                    questionOrder: 2,
                    quizId: 111
                },
                {
                    id: expect.any(Number),
                    qText: 'quiz 1 third question',
                    rightA: 'this',
                    wrongA1: 'not 1',
                    wrongA2: 'not 2',
                    wrongA3: 'not 3',
                    questionOrder: 3,
                    quizId: 111
                }
            ]
        });
    })

    test("throws error if not found", async function () {
        try {
            let quiz = await Quiz.get(0);
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
        let response = await Quiz.remove(111);
        expect(response).toBeUndefined();

        // make a GET request to verify that the quiz no longer exists
        try {
            await Quiz.get(111);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    test("throws error if not found", async function () {
        try {
            let quiz = await Quiz.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})