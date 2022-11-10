"use strict";

const request = require("supertest");
const app = require("../app");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    quizIds,
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /users
 */

describe("GET /users", function () {
    test("works", async function () {
        const response = await request(app).get("/users");
        expect(response.body).toEqual({
            users: [
                {
                    username: 'testuser',
                    firstName: 'First',
                    lastName: 'Last',
                    email: 'testuser@email.com'
                },
                {
                    username: 'testuser2',
                    firstName: 'First2',
                    lastName: 'Last2',
                    email: 'testuser2@email.com'
                }
            ]
        })
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * GET /users/:username
 */

describe("GET /users/:username", function () {
    test("works", async function () {
        const response = await request(app).get(`/users/testuser`);
        expect(response.body).toEqual({
            user: {
                username: 'testuser',
                firstName: 'First',
                lastName: 'Last',
                email: 'testuser@email.com',
                quizzes: [quizIds[0]]
            }
        })
    });

    test("fails for invalid username", async function () {
        const response = await request(app).get('/users/nobody');
        expect(response.statusCode).toEqual(404);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DELETE /users/:username
 */

describe("DELETE /users/:username", function () {
    test("works", async function () {
        let response = await request(app).delete(`/users/testuser`);
        expect(response.body).toEqual({ deleted: "testuser" });

        // make a GET request to ensure the quiz no longer exists
        response = await request(app).get(`/users/testuser}`);
        expect(response.statusCode).toEqual(404);
    });

    test("fails for invalid username", async function () {
        const response = await request(app).delete('/users/nobody');
        expect(response.statusCode).toEqual(404);
    });
});