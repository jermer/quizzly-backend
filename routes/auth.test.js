"use strict";

const request = require("supertest");
const app = require("../app");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * POST /auth/token
 */

describe("POST /auth/token", function () {
    test("works", async function () {
        const response = await request(app)
            .post("/auth/token")
            .send({
                username: "testuser2",
                password: "password"
            });
        expect(response.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("fails for wrong password", async function () {
        const response = await request(app)
            .post("/auth/token")
            .send({
                username: "testuser",
                password: "wrongpassword"
            });
        expect(response.statusCode).toEqual(401);
    });
});


