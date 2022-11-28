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
                    email: 'testuser@email.com'
                },
                {
                    username: 'testuser2',
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
                email: 'testuser@email.com',
                quizzes: [quizIds[0], quizIds[2]]
            }
        })
    });

    test("fails for invalid username", async function () {
        const response = await request(app).get('/users/nobody');
        expect(response.statusCode).toEqual(404);
    });

});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PATCH /users/:username
 */

describe("PATCH /users/:username", function () {
    // test("works for admins", async function () {
    //     const resp = await request(app)
    //         .patch(`/users/u1`)
    //         .send({
    //             firstName: "New",
    //         })
    //         .set("authorization", `Bearer ${adminToken}`);
    //     expect(resp.body).toEqual({
    //         user: {
    //             username: "u1",
    //             firstName: "New",
    //             lastName: "U1L",
    //             email: "user1@user.com",
    //             isAdmin: false,
    //         },
    //     });
    // });

    // test("works for same user", async function () {
    //     const resp = await request(app)
    //         .patch(`/users/u1`)
    //         .send({
    //             firstName: "New",
    //         })
    //         .set("authorization", `Bearer ${u1Token}`);
    //     expect(resp.body).toEqual({
    //         user: {
    //             username: "u1",
    //             firstName: "New",
    //             lastName: "U1L",
    //             email: "user1@user.com",
    //             isAdmin: false,
    //         },
    //     });
    // });

    // test("unauth if not same user", async function () {
    //     const resp = await request(app)
    //         .patch(`/users/u1`)
    //         .send({
    //             firstName: "New",
    //         })
    //         .set("authorization", `Bearer ${u2Token}`);
    //     expect(resp.statusCode).toEqual(401);
    // });

    // test("unauth for anon", async function () {
    //     const resp = await request(app)
    //         .patch(`/users/u1`)
    //         .send({
    //             firstName: "New",
    //         });
    //     expect(resp.statusCode).toEqual(401);
    // });

    test("fails if invalid username", async function () {
        const resp = await request(app)
            .patch(`/users/nope`)
            .send({
                email: "nope@email.com",
            })
        // .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("fails if invalid data", async function () {
        const resp = await request(app)
            .patch(`/users/testuser`)
            .send({
                email: 42,
            })
        // .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    // test("works: can set new password", async function () {
    //     const resp = await request(app)
    //         .patch(`/users/u1`)
    //         .send({
    //             password: "new-password",
    //         })
    //         .set("authorization", `Bearer ${adminToken}`);
    //     expect(resp.body).toEqual({
    //         user: {
    //             username: "u1",
    //             firstName: "U1F",
    //             lastName: "U1L",
    //             email: "user1@user.com",
    //             isAdmin: false,
    //         },
    //     });
    //     const isSuccessful = await User.authenticate("u1", "new-password");
    //     expect(isSuccessful).toBeTruthy();
    // });
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