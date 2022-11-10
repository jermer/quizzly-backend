"use strict"

const request = require("supertest");
const app = require("../app");
const { NotFoundError } = require("../expressError");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    quizIds,
    questionIds
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * POST /questions
 */
describe("POST /quizzes", function () {
    test("works", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                q_text: 'a new question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: quizIds[1]
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            question: {
                id: expect.any(Number),
                q_text: 'a new question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: quizIds[1]
            }
        })
    });

    test("fails for invalid quiz_id", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                q_text: 'a new question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: 0
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing data", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                q_text: 'a new question',
                quiz_id: quizIds[1]
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for extra fields in request", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                q_text: 'a new question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: quizIds[1],
                other: 'not allowed'
            });
        expect(response.statusCode).toEqual(400);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /questions
 */

describe("GET /questions", function () {
    test("works: all questions", async function () {
        const response = await request(app).get("/questions");
        expect(response.body).toEqual({
            questions: [
                {
                    id: expect.any(Number),
                    q_text: 'quiz 1 first question',
                    right_a: 'yes',
                    wrong_a1: 'no 1',
                    wrong_a2: 'no 2',
                    wrong_a3: 'no 3',
                    question_order: 1,
                    quiz_id: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    q_text: 'quiz 1 second question',
                    right_a: 'yep',
                    wrong_a1: 'nope 1',
                    wrong_a2: 'nope 2',
                    wrong_a3: 'nope 3',
                    question_order: 2,
                    quiz_id: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    q_text: 'quiz 1 third question',
                    right_a: 'this',
                    wrong_a1: 'not 1',
                    wrong_a2: 'not 2',
                    wrong_a3: 'not 3',
                    question_order: 3,
                    quiz_id: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    q_text: 'the only question on quiz two',
                    right_a: 'correct',
                    wrong_a1: 'oops 1',
                    wrong_a2: 'oops 2',
                    wrong_a3: 'oops 3',
                    question_order: 1,
                    quiz_id: expect.any(Number)
                }
            ]
        })
    });

    test("works: filter by quiz_id", async function () {
        const response = await request(app)
            .get("/questions")
            .query({ quiz_id: quizIds[1] });
        expect(response.body).toEqual({
            questions: [
                {
                    id: expect.any(Number),
                    q_text: 'the only question on quiz two',
                    right_a: 'correct',
                    wrong_a1: 'oops 1',
                    wrong_a2: 'oops 2',
                    wrong_a3: 'oops 3',
                    question_order: 1,
                    quiz_id: quizIds[1]
                }
            ]
        })
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /questons/:id
 */

describe("GET /questions/:id", function () {
    test("works", async function () {
        const response = await request(app).get(`/questions/${questionIds[0]}`);
        expect(response.body).toEqual({
            question: {
                id: expect.any(Number),
                q_text: 'quiz 1 first question',
                right_a: 'yes',
                wrong_a1: 'no 1',
                wrong_a2: 'no 2',
                wrong_a3: 'no 3',
                question_order: 1,
                quiz_id: quizIds[0]
            }
        })
    });

    test("fails for invalid id", async function () {
        const response = await request(app).get('/questions/0');
        expect(response.statusCode).toEqual(404);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DELETE /questions/:id
 */

describe("DELETE /questions/:id", function () {
    test("works", async function () {
        let response = await request(app).delete(`/questions/${questionIds[0]}`);
        expect(response.body).toEqual({ deleted: `${questionIds[0]}` });

        // make a GET request to ensure the quiz no longer exists
        response = await request(app).get(`/questions/${questionIds[0]}`);
        expect(response.statusCode).toEqual(404);
    });

    test("fails for invalid id", async function () {
        const response = await request(app).delete('/questions/0');
        expect(response.statusCode).toEqual(404);
    });
});