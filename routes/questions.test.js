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
                qText: 'a new question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: quizIds[1]
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            question: {
                id: expect.any(Number),
                qText: 'a new question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: quizIds[1]
            }
        })
    });

    test("fails for invalid quiz_id", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                qText: 'a new question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: 0
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing data", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                qText: 'a new question',
                quizId: quizIds[1]
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for extra fields in request", async function () {
        const response = await request(app)
            .post("/questions")
            .send({
                qText: 'a new question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: quizIds[1],
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
                    qText: 'quiz 1 first question',
                    rightA: 'yes',
                    wrongA1: 'no 1',
                    wrongA2: 'no 2',
                    wrongA3: 'no 3',
                    questionOrder: 1,
                    quizId: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    qText: 'quiz 1 second question',
                    rightA: 'yep',
                    wrongA1: 'nope 1',
                    wrongA2: 'nope 2',
                    wrongA3: 'nope 3',
                    questionOrder: 2,
                    quizId: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    qText: 'quiz 1 third question',
                    rightA: 'this',
                    wrongA1: 'not 1',
                    wrongA2: 'not 2',
                    wrongA3: 'not 3',
                    questionOrder: 3,
                    quizId: expect.any(Number)
                },
                {
                    id: expect.any(Number),
                    qText: 'the only question on quiz two',
                    rightA: 'correct',
                    wrongA1: 'oops 1',
                    wrongA2: 'oops 2',
                    wrongA3: 'oops 3',
                    questionOrder: 1,
                    quizId: expect.any(Number)
                }
            ]
        })
    });

    test("works: filter by quizId", async function () {
        const response = await request(app)
            .get("/questions")
            .query({ quizId: quizIds[1] });
        expect(response.body).toEqual({
            questions: [
                {
                    id: expect.any(Number),
                    qText: 'the only question on quiz two',
                    rightA: 'correct',
                    wrongA1: 'oops 1',
                    wrongA2: 'oops 2',
                    wrongA3: 'oops 3',
                    questionOrder: 1,
                    quizId: quizIds[1]
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
                id: questionIds[0],
                qText: 'quiz 1 first question',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: quizIds[0]
            }
        })
    });

    test("fails for invalid id", async function () {
        const response = await request(app).get('/questions/0');
        expect(response.statusCode).toEqual(404);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PATCH /questions/:id
 */

describe("PATCH /questions/:id", function () {
    test("works", async function () {
        const resp = await request(app)
            .patch(`/questions/${questionIds[0]}`)
            .send({
                qText: "new question text",
            })
        // .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            question: {
                id: questionIds[0],
                qText: 'new question text',
                rightA: 'yes',
                wrongA1: 'no 1',
                wrongA2: 'no 2',
                wrongA3: 'no 3',
                questionOrder: 1,
                quizId: quizIds[0]
            },
        });
    });

    test("fails for invalid id", async function () {
        const response = await request(app)
            .patch('/questions/0')
            .send({
                qText: "new question text",
            });
        expect(response.statusCode).toEqual(404);
    });

    test("fails for no update data", async function () {
        const response = await request(app)
            .patch(`/questions/${questionIds[0]}`);
        expect(response.statusCode).toEqual(400);
    });

})

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