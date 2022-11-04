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
                firstName: "Fir",
                lastName: "Las",
                email: "firlas@email.com"
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
                firstName: "Fir",
                lastName: "Las",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing username", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                password: "password",
                firstName: "Fir",
                lastName: "Las",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing password", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                firstName: "Fir",
                lastName: "Las",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing first name", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
                lastName: "Las",
                email: "firlas@email.com"
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for missing last name", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
                firstName: "Fir",
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
                firstName: "Fir",
                lastName: "Las",
            });
        expect(response.statusCode).toEqual(400);
    });

    test("fails for malformed email", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                username: "testuser",
                password: "password",
                firstName: "Fir",
                lastName: "Las",
                email: "malformed-email"
            });
        expect(response.statusCode).toEqual(400);
    });

});
