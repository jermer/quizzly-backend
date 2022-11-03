"use strict";

// const db = require("../db");
const User = require("../models/user");
const {
    UnauthorizedError
} = require("../expressError");

describe("authenticate", function () {

    test("unauthorized if no such user", async function () {
        try {
            await User.authenticate("badusername", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

});