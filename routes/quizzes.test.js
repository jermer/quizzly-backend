"use strict"

const request = require("supertest");
const app = require("../app");
const { NotFoundError } = require("../expressError");
const { findAll } = require("../models/user");

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
                isPublic: false,
                creator: "testuser"
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            quiz: {
                id: expect.any(Number),
                title: "new quiz",
                description: "brand new quiz",
                isPublic: false,
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
    test("works: all quizzes", async function () {
        const response = await request(app).get("/quizzes");
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: quizIds[0],
                    title: 'quiz one',
                    description: 'the first test quiz',
                    isPublic: false,
                    creator: 'testuser'
                },
                {
                    id: quizIds[1],
                    title: 'quiz two',
                    description: 'the second test quiz',
                    isPublic: false,
                    creator: 'testuser2'
                },
                {
                    id: quizIds[2],
                    title: 'quiz three',
                    description: 'the third test quiz',
                    isPublic: true,
                    creator: 'testuser'
                }
            ]
        })
    });

    test("works: filter quizzes by searchString", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ searchString: 'two' });
        // should find only 'two' in quiz two title
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: quizIds[1],
                    title: 'quiz two',
                    description: 'the second test quiz',
                    isPublic: false,
                    creator: 'testuser2'
                }
            ]
        })
    })

    test("works: filter quizzes by searchString", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ searchString: 'on' });
        // should find 'on' in quiz one title and quiz two description
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: quizIds[0],
                    title: 'quiz one',
                    description: 'the first test quiz',
                    isPublic: false,
                    creator: 'testuser'
                },
                {
                    id: quizIds[1],
                    title: 'quiz two',
                    description: 'the second test quiz',
                    isPublic: false,
                    creator: 'testuser2'
                }
            ]
        })
    })

    test("works: filter quizzes by creator", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ creator: 'testuser2' });
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: quizIds[1],
                    title: 'quiz two',
                    description: 'the second test quiz',
                    isPublic: false,
                    creator: 'testuser2'
                }
            ]
        })
    })

    test("works: filter quizzes by creator", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ creator: 'testuser3' });
        expect(response.body).toEqual({
            quizzes: []
        })
    })

    test("works: filter quizzes by isPublic", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ isPublic: true });
        expect(response.body).toEqual({
            quizzes: [
                {
                    id: quizIds[2],
                    title: 'quiz three',
                    description: 'the third test quiz',
                    isPublic: true,
                    creator: 'testuser'
                }
            ]
        })
    })

    test("fails if isPublic is not boolean value", async function () {
        const response = await request(app)
            .get("/quizzes")
            .query({ isPublic: "oops" });
        expect(response.statusCode).toEqual(400);
    })
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
                isPublic: false,
                creator: 'testuser2',
                questions: [
                    {
                        id: expect.any(Number),
                        qText: 'the only question on quiz two',
                        rightA: 'correct',
                        wrongA1: 'oops 1',
                        wrongA2: 'oops 2',
                        wrongA3: 'oops 3',
                        quizId: quizIds[1]
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
 * PATCH /quizzes/:id
 */

describe("PATCH /quizzes/:id", function () {
    test("works", async function () {
        const resp = await request(app)
            .patch(`/quizzes/${quizIds[0]}`)
            .send({
                title: "new quiz 1 title",
                isPublic: true
            })
        // .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            quiz: {
                id: quizIds[0],
                title: "new quiz 1 title",
                description: "the first test quiz",
                isPublic: true,
                creator: "testuser"
            },
        });
    });

    test("fails for invalid id", async function () {
        const response = await request(app)
            .patch('/quizzes/0')
            .send({
                title: "new quiz 1 title",
            });
        expect(response.statusCode).toEqual(404);
    });

    test("fails for no update data", async function () {
        const response = await request(app)
            .patch(`/quizzes/${quizIds[0]}`);
        expect(response.statusCode).toEqual(400);
    });

    // MORE TO DO HERE
    test("more work to do here", async function () {
        // expect(1).toEqual(2);
    })
})


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