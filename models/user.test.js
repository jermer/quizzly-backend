"use strict";

// const db = require("../db");
const User = require("../models/user");
const {
    UnauthorizedError,
    NotFoundError
} = require("../expressError");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Authenticate
 */

describe("authenticate", function () {
    test("works", async function () {
        const user = await User.authenticate("testuser", "password");
        expect(user).toEqual({
            username: "testuser",
            firstName: "First",
            lastName: "Last",
            email: "testuser@email.com"
        })
    });

    test("unauthorized if wrong password", async function () {
        try {
            await User.authenticate("testuser", "wrongpassword");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauthorized if invalid username", async function () {
        try {
            await User.authenticate("badusername", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Register
 */

describe("register", function () {
    // test("works", async function(){
    // });

    // test all the bad inputs...
})


/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * findAll
 */

describe("findAll", function () {
    test("works", async function () {
        const users = await User.findAll();
        expect(users).toEqual([
            {
                username: "testuser",
                firstName: "First",
                lastName: "Last",
                email: "testuser@email.com"
            },
            {
                username: "testuser2",
                firstName: "First2",
                lastName: "Last2",
                email: "testuser2@email.com"
            }
        ]);
    });
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Get
 */

describe("get", function () {
    test("works", async function () {
        const user = await User.get("testuser");
        expect(user).toEqual({
            username: "testuser",
            firstName: "First",
            lastName: "Last",
            email: "testuser@email.com"
        });
    });

    test("fails for invalid username", async function () {
        try {
            await User.get("badusername");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Update
 */


/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Remove
 */

describe("remove", function () {
    test("works", async function () {
        const result = await User.remove("testuser");
        expect(result).toBeUndefined();

        // check to ensure the user no longer exists
        try {
            await User.get("testuser");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("fails for invalid username", async function () {
        try {
            await User.remove("badusername");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
})