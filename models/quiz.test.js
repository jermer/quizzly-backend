"use strict";

// const db = require("../db");
const Quiz = require("../models/quiz");
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
                isPublic: false,
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
                isPublic: false,
                creator: 'testuser'
            },
            {
                id: 222,
                title: 'quiz two',
                description: 'the second test quiz',
                isPublic: false,
                creator: 'testuser2'
            },
            {
                id: 333,
                title: 'quiz three',
                description: 'the third test quiz',
                isPublic: true,
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
            description: 'the first test quiz',
            isPublic: false,
            creator: 'testuser',
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
 * Update
 */

describe("update", function () {
    const updateData = {
        title: "NewTitle",
        description: "New description!",
        isPublic: true
    }

    test("works", async function () {
        let response = await Quiz.update(111, updateData);
        expect(response).toEqual({
            id: 111,
            title: "NewTitle",
            description: "New description!",
            isPublic: true,
            creator: "testuser"
        });
    })

    test("throws not found error if invalid quiz id", async function () {
        try {
            await Quiz.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })

    test("throws bad request error if no update data", async function () {
        try {
            await Quiz.update(111, {});
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