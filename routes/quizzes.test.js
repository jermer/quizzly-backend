"use strict"

const request = require("supertest");
const app = require("../app");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    quizIds
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
                description: "brand new quiz"
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            quiz: {
                id: expect.any(Number),
                title: "new quiz",
                description: "brand new quiz"
            }
        })
    });

    test("fails for missing title", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                description: "brand new quiz"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing description", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for extra fields in request", async function () {
        const response = await request(app)
            .post("/quizzes")
            .send({
                title: "new quiz",
                description: "brand new quiz",
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
                    description: 'the first test quiz'
                },
                {
                    id: expect.any(Number),
                    title: 'quiz two',
                    description: 'the second test quiz'
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
        console.log("**** TESTING", quizIds[0]);

        const response = await request(app).get(`/quizzes/${quizIds[0]}`);
        expect(response.body).toEqual({
            quiz: {
                id: expect.any(Number),
                title: 'quiz one',
                description: 'the first test quiz',
                questions: []
            }
        })
    });

});