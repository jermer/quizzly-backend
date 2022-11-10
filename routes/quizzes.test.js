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
 * POST /quizzes
 */
describe("POST /quizzes", function () {
    test("works", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz",
                description: "brand new quiz",
                creator: "testuser"
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            quiz: {
                id: expect.any(Number),
                title: "new quiz",
                description: "brand new quiz",
                creator: "testuser"
            }
        })
    });

    test("fails for missing title", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                description: "brand new quiz",
                creator: "testuser"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing description", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz",
                creator: "testuser"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing creator", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz",
                description: "brand new quiz",
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for extra fields in request", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz",
                description: "brand new quiz",
                creator: "testuser",
                other: "not allowed"
            });
        expect(response.statusCode).toEqual(400);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /quizzes
 */

describe("GET /quizzes", function () {
    test("works", async function () {
        const response = await request(app).get("/quizzes");
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: expect.any(Number),
                    title: 'quiz one',
                    description: 'the first test quiz',
                    creator: 'testuser'
                },
                {
                    id: expect.any(Number),
                    title: 'quiz two',
                    description: 'the second test quiz',
                    creator: 'testuser2'
                }
            ]
        })
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /quizzes/:id
 */

describe("GET /quizzes/:id", function () {
    test("works", async function () {
        const response = await request(app).get(`/quizzes/${quizIds[1]}`);
        expect(response.body).toEqual({
            quiz: {
                id: expect.any(Number),
                title: 'quiz two',
                description: 'the second test quiz',
                creator: 'testuser2',
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
            }
        })
    });

    test("fails for invalid id", async function () {
        const response = await request(app).get('/quizzes/0');
        expect(response.statusCode).toEqual(404);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DELETE /quizzes/:id
 */

describe("DELETE /quizzes/:id", function () {
    test("works", async function () {
        let response = await request(app).delete(`/quizzes/${quizIds[0]}`);
        expect(response.body).toEqual({ deleted: `${quizIds[0]}` });

        // make a GET request to ensure the quiz no longer exists
        response = await request(app).get(`/quizzes/${quizIds[0]}`);
        expect(response.statusCode).toEqual(404);

        // make a GET request to ensure that this quiz's questions were also deleted
        response = await request(app).get(`/questions/${questionIds[0]}`);
        expect(response.statusCode).toEqual(404);
    });

    test("fails for invalid id", async function () {
        const response = await request(app).delete('/quizzes/0');
        expect(response.statusCode).toEqual(404);
    });
});