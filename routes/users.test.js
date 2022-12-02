"use strict";

const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    quizIds,
    testUserToken,
    testUser2Token,
    testAdminToken
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /users
 */

describe("GET /users", function () {
    test("works for admin", async function () {
        const response = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.body).toEqual({
            users: [
                {
                    username: 'testadmin',
                    email: 'testadmin@email.com',
                    isAdmin: true
                },
                {
                    username: 'testuser',
                    email: 'testuser@email.com',
                    isAdmin: false
                },
                {
                    username: 'testuser2',
                    email: 'testuser2@email.com',
                    isAdmin: false
                }
            ]
        })
    });

    test("unauthorized for non-admin", async function () {
        const response = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${testUserToken}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauthorized for anonymous", async function () {
        const response = await request(app)
            .get("/users");
        expect(response.statusCode).toEqual(401);
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /users/:username
 */

describe("GET /users/:username", function () {
    test("works for admin", async function () {
        const response = await request(app)
            .get(`/users/testuser`)
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.body).toEqual({
            user: {
                username: 'testuser',
                email: 'testuser@email.com',
                isAdmin: false,
                quizzes: [quizIds[0], quizIds[2]],
                scores: []
            }
        })
    });

    test("works for same user", async function () {
        const response = await request(app)
            .get(`/users/testuser`)
            .set("authorization", `Bearer ${testUserToken}`);
        expect(response.body).toEqual({
            user: {
                username: 'testuser',
                email: 'testuser@email.com',
                isAdmin: false,
                quizzes: [quizIds[0], quizIds[2]],
                scores: []
            }
        })
    });

    test("unauthorized for different user", async function () {
        const response = await request(app)
            .get('/users/testuser')
            .set("authorization", `Bearer ${testUser2Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauthorized for anonymous", async function () {
        const response = await request(app)
            .get('/users/testuser');
        expect(response.statusCode).toEqual(401);
    });

    test("not found for invalid username", async function () {
        const response = await request(app)
            .get('/users/nobody')
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PATCH /users/:username
 */

describe("PATCH /users/:username", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: "new@email.com"
            })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "testuser",
                email: "new@email.com",
                isAdmin: false,
            }
        });
    });

    test("works for same user", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: "new@email.com"
            })
            .set("authorization", `Bearer ${testUserToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "testuser",
                email: "new@email.com",
                isAdmin: false,
            }
        });
    });

    test("unauthorized for different user", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: "new@email.com"
            })
            .set("authorization", `Bearer ${testUser2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauthorized for anonymous", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: "new@email.com"
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if invalid username", async function () {
        const resp = await request(app)
            .patch(`/users/nope`)
            .send({
                email: "nope@email.com",
            })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request if invalid data", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: 42,
            })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("can set new password", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: "new@email.com",
                password: "newpassword"
            })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(resp.body).toEqual({
            user: {
                username: "testuser",
                email: "new@email.com",
                isAdmin: false,
            }
        });
        const isSuccessful = await User.authenticate({
            username: "testuser",
            password: "newpassword"
        });
        expect(isSuccessful).toBeTruthy();
    });
});


/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DELETE /users/:username
 */

describe("DELETE /users/:username", function () {
    test("works for admin", async function () {
        let response = await request(app)
            .delete(`/users/testuser`)
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.body).toEqual({ deleted: "testuser" });

        // make a GET request to ensure the quiz no longer exists
        response = await request(app)
            .get(`/users/testuser}`)
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("works for same user", async function () {
        let response = await request(app)
            .delete(`/users/testuser`)
            .set("authorization", `Bearer ${testUserToken}`);
        expect(response.body).toEqual({ deleted: "testuser" });

        // make a GET request to ensure the quiz no longer exists
        response = await request(app)
            .get(`/users/testuser}`)
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("unauthorized for different user", async function () {
        const resp = await request(app)
            .delete(`/users/testuser`)
            .set("authorization", `Bearer ${testUser2Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauthorized for anonymous", async function () {
        const resp = await request(app)
            .delete(`/users/testuser`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for invalid username", async function () {
        const response = await request(app)
            .delete('/users/nobody')
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * POST /users/:username/quizzes/:quizId
 */

describe("POST /users/:username/quizzes/:quizId", function () {
    test("works for admin", async function () {
        let response = await request(app)
            .post(`/users/testuser/quizzes/${quizIds[0]}`)
            .send({ score: 4 })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.body).toEqual({
            score: {
                quizId: quizIds[0],
                title: 'quiz one',
                lastScore: 4,
                bestScore: 4,
                numQuestions: '3',
                timeTaken: expect.any(String)
            }
        })

        // make score update
        response = await request(app)
            .post(`/users/testuser/quizzes/${quizIds[0]}`)
            .send({ score: 0 })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.body).toEqual({
            score: {
                quizId: quizIds[0],
                title: 'quiz one',
                lastScore: 0,
                bestScore: 4,
                numQuestions: '3',
                timeTaken: expect.any(String)
            }
        })
    });

    test("works for same user", async function () {
        let response = await request(app)
            .post(`/users/testuser/quizzes/${quizIds[0]}`)
            .send({ score: 4 })
            .set("authorization", `Bearer ${testUserToken}`);
        expect(response.body).toEqual({
            score: {
                quizId: quizIds[0],
                title: 'quiz one',
                lastScore: 4,
                bestScore: 4,
                numQuestions: '3',
                timeTaken: expect.any(String)
            }
        })

        // make score update
        response = await request(app)
            .post(`/users/testuser/quizzes/${quizIds[0]}`)
            .send({ score: 0 })
            .set("authorization", `Bearer ${testUserToken}`);
        expect(response.body).toEqual({
            score: {
                quizId: quizIds[0],
                title: 'quiz one',
                lastScore: 0,
                bestScore: 4,
                numQuestions: '3',
                timeTaken: expect.any(String)
            }
        })
    });

    test("unauthorized for different user", async function () {
        const response = await request(app)
            .post(`/users/nobody/quizzes/${quizIds[0]}`)
            .send({ score: 4 })
            .set("authorization", `Bearer ${testUser2Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("unauthorized for anonymous", async function () {
        const response = await request(app)
            .post(`/users/nobody/quizzes/${quizIds[0]}`)
            .send({ score: 4 });
        expect(response.statusCode).toEqual(401);
    });

    test("not found for invalid username", async function () {
        const response = await request(app)
            .post(`/users/nobody/quizzes/${quizIds[0]}`)
            .send({ score: 4 })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("not found for invalid quiz id", async function () {
        const response = await request(app)
            .post(`/users/testuser/quizzes/0`)
            .send({ score: 4 })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(404);
    });

    test("bad request for invalid score", async function () {
        const response = await request(app)
            .post(`/users/testuser/quizzes/${quizIds[0]}}`)
            .send({ score: "oops" })
            .set("authorization", `Bearer ${testAdminToken}`);
        expect(response.statusCode).toEqual(400);
    });
});