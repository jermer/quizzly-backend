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

    test("fails for invalid username", async function () {
        const response = await request(app)
            .post("/auth/token")
            .send({
                username: "badusername",
                password: "password"
            });
        expect(response.statusCode).toEqual(401);
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

    test("fails for missing data", async function () {
        const response = await request(app)
            .post("/auth/token")
            .send({
                username: "testuser",
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for invalid data", async function () {
        const response = await request(app)
            .post("/auth/token")
            .send({
                username: 0,
                password: "password"
            });
        expect(response.statusCode).toEqual(400);
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * POST /auth/validate
 */

describe("POST /auth/validate", function () {
    test("works", async function () {
        const response = await request(app)
            .post("/auth/validate")
            .send({
                username: "testuser",
                password: "password"
            });
        expect(response.body).toEqual({
            "success": true
        });
    });

    test("fails for wrong password", async function () {
        const response = await request(app)
            .post("/auth/validate")
            .send({
                username: "testuser",
                password: "wrongpassword"
            });
        expect(response.body).toEqual({
            "success": false
        });
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * POST /auth/register
 */

describe("POST /auth/register", function () {
    test("works", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "newuser",
                password: "password",
                email: "firlas@email.com",
                isAdmin: false
            });
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("fails for duplicate username", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
                email: "firlas@email.com",
                isAdmin: false
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing username", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                password: "password",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing password", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing email", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for malformed email", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
                email: "malformed-email"
            });
        expect(response.statusCode).toEqual(400);
    });

});
